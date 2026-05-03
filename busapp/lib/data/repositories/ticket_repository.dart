import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import '../../core/api_client.dart';
import '../models/ticket_model.dart';

class TicketRepository {
  final ApiClient _apiClient;

  TicketRepository(this._apiClient);

  // --- ONLINE / HYBRID METHODS ---

  Future<List<Location>> getLocations() async {
    try {
      // Try online first
      final response = await _apiClient.client.get('/master/locations');
      return (response.data as List).map((e) => Location.fromJson(e)).toList();
    } catch (e) {
      // Fallback to offline
      return await getOfflineLocations();
    }
  }

  Future<List<Bus>> getBuses() async {
    try {
      final response = await _apiClient.client.get('/buses');
      return (response.data as List).map((e) => Bus.fromJson(e)).toList();
    } catch (e) {
      return await getOfflineBuses();
    }
  }

  Future<List<PayMode>> getPayModes() async {
    try {
      final response = await _apiClient.client.get('/master/pay-modes');
      return (response.data as List).map((e) => PayMode.fromJson(e)).toList();
    } catch (e) {
      return await getOfflinePayModes();
    }
  }

  Future<double> checkFare(String source, String destination) async {
    try {
      // Try online
      final response = await _apiClient.client.get(
        '/master/fares',
        queryParameters: {'source': source, 'destination': destination},
      );
      return (response.data['amount'] ?? 0).toDouble();
    } catch (e) {
      // Fallback to offline calculation
      return await checkOfflineFare(source, destination);
    }
  }

  Future<Ticket> issueTicket({
    required String busId,
    required String source,
    required String destination,
    required int adultCount,
    required int childCount,
    required double totalAmount,
    required String payMode, // Pass total from UI/Calculation
  }) async {
    // Try online first
    try {
      final response = await _apiClient.client.post(
        '/tickets',
        data: {
          'busId': busId,
          'source': source,
          'destination': destination,
          'adultCount': adultCount,
          'childCount': childCount,
          'payMode': payMode,
        },
      );
      return Ticket.fromJson(response.data);
    } catch (e) {
      // If offline or failed, save locally
      return await _saveOfflineTicket(
        busId,
        source,
        destination,
        adultCount,
        childCount,
        totalAmount,
        payMode,
      );
    }
  }

  Future<List<Ticket>> getMyTickets() async {
    try {
      final response = await _apiClient.client.get('/tickets');
      return (response.data as List).map((e) => Ticket.fromJson(e)).toList();
    } catch (e) {
      return []; // Could return cached valid tickets if needed
    }
  }

  Future<Map<String, dynamic>> getDailyBill() async {
    try {
      final response = await _apiClient.client.get('/tickets/daily-bill');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      return {'totalAmount': 0, 'ticketsCount': 0, 'adultsCount': 0, 'childrenCount': 0};
    }
  }

  // --- OFFLINE & SYNC LOGIC ---

  Future<void> downloadMasterData(Function(int progress) onProgress) async {
    final prefs = await SharedPreferences.getInstance();

    // 1. Buses
    onProgress(10);
    try {
      final busRes = await _apiClient.client.get('/buses');
      await prefs.setString('offline_buses', jsonEncode(busRes.data));
    } catch (e) {
      print('Bus DL failed');
    }

    // 2. Locations
    onProgress(40);
    try {
      final locRes = await _apiClient.client.get('/master/locations');
      await prefs.setString('offline_locations', jsonEncode(locRes.data));
    } catch (e) {
      print('Loc DL failed');
    }

    // 3. Fares
    onProgress(70);
    try {
      final fareRes = await _apiClient.client.get('/master/fares');
      // Store complete fare list
      // Note: The API /master/fares might return list of all fares.
      // If it only supports search, we need an endpoint for ALL fares or we can't fully work offline.
      // Assuming /master/fares without query params returns ALL. If not, backend needs update.
      // Based on typical REST, GET /resource usually lists all.
      await prefs.setString('offline_fares', jsonEncode(fareRes.data));
    } catch (e) {
      print('Fare DL failed');
    }

    // 4. Pay Modes
    onProgress(90);
    try {
      final pmRes = await _apiClient.client.get('/master/pay-modes');
      await prefs.setString('offline_pay_modes', jsonEncode(pmRes.data));
    } catch (e) {
      print('PayMode DL failed');
    }

    onProgress(100);
  }

  Future<List<Location>> getOfflineLocations() async {
    final prefs = await SharedPreferences.getInstance();
    final String? str = prefs.getString('offline_locations');
    if (str == null) return [];
    return (jsonDecode(str) as List).map((e) => Location.fromJson(e)).toList();
  }

  Future<List<Bus>> getOfflineBuses() async {
    final prefs = await SharedPreferences.getInstance();
    final String? str = prefs.getString('offline_buses');
    if (str == null) return [];
    return (jsonDecode(str) as List).map((e) => Bus.fromJson(e)).toList();
  }

  Future<List<PayMode>> getOfflinePayModes() async {
    final prefs = await SharedPreferences.getInstance();
    final String? str = prefs.getString('offline_pay_modes');
    if (str == null) return [];
    return (jsonDecode(str) as List).map((e) => PayMode.fromJson(e)).toList();
  }

  Future<double> checkOfflineFare(String source, String destination) async {
    final prefs = await SharedPreferences.getInstance();
    final String? str = prefs.getString('offline_fares');
    if (str == null) return 0.0;

    final List list = jsonDecode(str);
    // Find matching fare
    final match = list.firstWhere(
      (f) => f['source'] == source && f['destination'] == destination,
      orElse: () => null,
    );

    return match != null ? (match['amount'] ?? 0).toDouble() : 0.0;
  }

  Future<Ticket> _saveOfflineTicket(
    String busId,
    String src,
    String dst,
    int ac,
    int cc,
    double total,
    String payMode,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> pending = prefs.getStringList('pending_tickets') ?? [];

    final Map<String, dynamic> ticketData = {
      'busId': busId,
      'source': src,
      'destination': dst,
      'adultCount': ac,
      'childCount': cc,
      'totalAmount': total,
      'payMode': payMode,
      // For local display only
      'ticketNumber':
          'OFF-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}', // Temp ID
      'createdAt': DateTime.now().toIso8601String(),
      'bus': {
        '_id': busId,
        'name': 'Offline Bus',
        'busNumber': '',
      }, // dummy for UI
    };

    pending.add(jsonEncode(ticketData));
    await prefs.setStringList('pending_tickets', pending);

    return Ticket.fromJson(ticketData);
  }

  Future<int> getPendingTicketCount() async {
    final prefs = await SharedPreferences.getInstance();
    return (prefs.getStringList('pending_tickets') ?? []).length;
  }

  Future<void> syncPendingTickets() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> pending = prefs.getStringList('pending_tickets') ?? [];
    if (pending.isEmpty) return;

    final List<String> failed = [];

    for (String str in pending) {
      try {
        final Map<String, dynamic> data = jsonDecode(str);
        // Clean up data for API (remove local only fields)
        await _apiClient.client.post(
          '/tickets',
          data: {
            'busId': data['busId'],
            'source': data['source'],
            'destination': data['destination'],
            'adultCount': data['adultCount'],
            'childCount': data['childCount'],
            'payMode': data['payMode'] ?? 'Cash',
          },
        );
      } catch (e) {
        // If fail, keep in list
        failed.add(str);
      }
    }

    // Save back failed (or empty if all good)
    await prefs.setStringList('pending_tickets', failed);

    if (failed.isNotEmpty) {
      throw '${failed.length} tickets failed to sync';
    }
  }
}
