import 'dart:convert';

import 'package:dio/dio.dart';
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

  Future<Bus> createBus({
    required String name,
    required String busNumber,
    required int capacity,
    required String type,
    required String operatorName,
  }) async {
    try {
      final response = await _apiClient.client.post('/buses', data: {
        'name': name,
        'busNumber': busNumber,
        'capacity': capacity,
        'type': type,
        'operatorName': operatorName,
      });
      return Bus.fromJson(response.data);
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to create bus';
    }
  }

  Future<Bus> updateBus(String id, Map<String, dynamic> busData) async {
    try {
      final response = await _apiClient.client.put('/buses/$id', data: busData);
      return Bus.fromJson(response.data);
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to update bus';
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

  // --- ADMIN MASTER DATA METHODS ---

  Future<void> addLocation(String name, String code) async {
    await _apiClient.client.post('/master/locations', data: {'name': name, 'code': code});
  }

  Future<void> updateLocation(String id, String name, String code) async {
    await _apiClient.client.put('/master/locations/$id', data: {'name': name, 'code': code});
  }

  Future<void> deleteLocation(String id) async {
    await _apiClient.client.delete('/master/locations/$id');
  }

  Future<List<Fare>> getFares() async {
    final res = await _apiClient.client.get('/master/fares');
    return (res.data as List).map((e) => Fare.fromJson(e)).toList();
  }

  Future<void> updateFare(String source, String destination, double amount) async {
    await _apiClient.client.post('/master/fares', data: {
      'source': source,
      'destination': destination,
      'amount': amount,
    });
  }

  Future<void> deleteFare(String id) async {
    await _apiClient.client.delete('/master/fares/$id');
  }

  Future<List<BusRoute>> getRoutes() async {
    final res = await _apiClient.client.get('/master/routes');
    return (res.data as List).map((e) => BusRoute.fromJson(e)).toList();
  }

  Future<void> createRoute(String name, List<String> stops, String? description) async {
    await _apiClient.client.post('/master/routes', data: {
      'name': name,
      'stops': stops,
      'description': description,
    });
  }

  Future<void> updateRoute(String id, Map<String, dynamic> routeData) async {
    await _apiClient.client.put('/master/routes/$id', data: routeData);
  }

  Future<void> deleteRoute(String id) async {
    await _apiClient.client.delete('/master/routes/$id');
  }

  Future<void> addPayMode(String name, String icon, String color, int sortOrder) async {
    await _apiClient.client.post('/master/pay-modes', data: {
      'name': name,
      'icon': icon,
      'color': color,
      'sortOrder': sortOrder,
    });
  }

  Future<void> updatePayMode(String id, Map<String, dynamic> pmData) async {
    await _apiClient.client.put('/master/pay-modes/$id', data: pmData);
  }

  Future<void> deletePayMode(String id) async {
    await _apiClient.client.delete('/master/pay-modes/$id');
  }

  Future<List<Trip>> getTrips() async {
    final res = await _apiClient.client.get('/trips');
    return (res.data as List).map((e) => Trip.fromJson(e)).toList();
  }

  Future<void> createTrip(Map<String, dynamic> tripData) async {
    await _apiClient.client.post('/trips', data: tripData);
  }

  Future<void> deleteTrip(String id) async {
    await _apiClient.client.delete('/trips/$id');
  }

  Future<List<Ticket>> getAllTickets() async {
    final res = await _apiClient.client.get('/tickets/all');
    return (res.data as List).map((e) => Ticket.fromJson(e)).toList();
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

  Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _apiClient.client.get('/reports/dashboard');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw 'Failed to load report stats';
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
