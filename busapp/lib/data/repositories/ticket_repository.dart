import 'package:dio/dio.dart';
import '../../core/api_client.dart';
import '../models/ticket_model.dart';

class TicketRepository {
  final ApiClient _apiClient;

  TicketRepository(this._apiClient);

  Future<List<Location>> getLocations() async {
    try {
      final response = await _apiClient.client.get('/master/locations');
      return (response.data as List).map((e) => Location.fromJson(e)).toList();
    } catch (e) {
      throw 'Failed to fetch locations';
    }
  }

  Future<List<Bus>> getBuses() async {
    try {
      final response = await _apiClient.client.get('/buses');
      return (response.data as List).map((e) => Bus.fromJson(e)).toList();
    } catch (e) {
      throw 'Failed to fetch buses';
    }
  }

  Future<Ticket> issueTicket({
    required String busId,
    required String source,
    required String destination,
    required int adultCount,
    required int childCount,
  }) async {
    try {
      final response = await _apiClient.client.post(
        '/tickets',
        data: {
          'busId': busId,
          'source': source,
          'destination': destination,
          'adultCount': adultCount,
          'childCount': childCount,
        },
      );
      return Ticket.fromJson(response.data);
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to issue ticket';
    } catch (e) {
      throw 'An unexpected error occurred';
    }
  }

  Future<List<Ticket>> getMyTickets() async {
    try {
      final response = await _apiClient.client.get('/tickets');
      return (response.data as List).map((e) => Ticket.fromJson(e)).toList();
    } catch (e) {
      return [];
    }
  }
}
