import 'ticket_model.dart';

class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? token;
  final Bus? assignedBus;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.token,
    this.assignedBus,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'Employee',
      token: json['token'],
      assignedBus: json['assignedBus'] != null && json['assignedBus'] is Map
          ? Bus.fromJson(json['assignedBus'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'role': role,
      'token': token,
    };
  }

  /// Whether this user has admin privileges
  bool get isAdmin => role == 'Admin';

  /// Whether this user has a bus assigned to them
  bool get hasBusAssigned => assignedBus != null;

  /// Display string for the assigned bus
  String get assignedBusDisplay {
    if (!hasBusAssigned) return 'No bus assigned';
    return '${assignedBus!.name} (${assignedBus!.busNumber})';
  }
}
