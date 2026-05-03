import 'dart:convert';
import 'package:dio/dio.dart';
import '../../core/api_client.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _apiClient;

  AuthRepository(this._apiClient);

  Future<User> register(String name, String email, String password) async {
    try {
      final response = await _apiClient.client.post(
        '/auth/register',
        data: {'name': name, 'email': email, 'password': password},
      );

      final user = User.fromJson(response.data);
      if (user.token != null) {
        await _apiClient.setToken(user.token!);
        await _apiClient.saveUserData(jsonEncode(response.data));
      }
      return user;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Registration failed';
    } catch (e) {
      throw 'An unexpected error occurred';
    }
  }

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

  Future<List<User>> getUsers() async {
    try {
      final response = await _apiClient.client.get('/auth/users');
      return (response.data as List).map((u) => User.fromJson(u)).toList();
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to fetch users';
    }
  }

  Future<User> createUser(Map<String, dynamic> userData) async {
    try {
      final response = await _apiClient.client.post('/auth/users', data: userData);
      return User.fromJson(response.data);
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to create user';
    }
  }

  Future<User> updateUser(String id, Map<String, dynamic> userData) async {
    try {
      final response = await _apiClient.client.put('/auth/users/$id', data: userData);
      return User.fromJson(response.data);
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'Failed to update user';
    }
  }

  Future<void> logout() async {
    await _apiClient.clearToken();
  }
}
