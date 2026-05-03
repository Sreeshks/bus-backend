import 'dart:convert';
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
        await _apiClient.saveUserData(jsonEncode(response.data));
      }
      return user;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Login failed';
    } catch (e) {
      throw 'An unexpected error occurred';
    }
  }

  Future<User?> getSavedUser() async {
    final data = await _apiClient.getUserData();
    if (data != null) {
      try {
        return User.fromJson(jsonDecode(data));
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  Future<void> logout() async {
    await _apiClient.clearToken();
  }
}
