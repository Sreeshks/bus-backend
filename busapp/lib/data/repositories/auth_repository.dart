import 'package:dio/dio.dart';
import '../../core/api_client.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  Future<User> login(String email, String password) async {
    try {
      final response = await _apiClient.client.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );

      final user = User.fromJson(response.data);
      if (user.token != null) {
        await _apiClient.setToken(user.token!);
      }
      return user;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Login failed';
    } catch (e) {
      throw 'An unexpected error occurred';
    }
  }
}
