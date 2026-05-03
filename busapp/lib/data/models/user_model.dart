class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? token;
  final String? assignedBusId;
  final String? assignedBusName;
  final String? assignedBusNumber;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.token,
    this.assignedBusId,
    this.assignedBusName,
    this.assignedBusNumber,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // assignedBus can be null, a string (ID only), or a populated object
    String? busId;
    String? busName;
    String? busNumber;

    final ab = json['assignedBus'];
    if (ab is Map<String, dynamic>) {
      busId = ab['_id'] ?? '';
      busName = ab['name'] ?? '';
      busNumber = ab['busNumber'] ?? '';
    } else if (ab is String) {
      busId = ab;
    }

    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'Employee',
      token: json['token'],
      assignedBusId: busId,
      assignedBusName: busName,
      assignedBusNumber: busNumber,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'role': role,
      'token': token,
      'assignedBusId': assignedBusId,
      'assignedBusName': assignedBusName,
      'assignedBusNumber': assignedBusNumber,
    };
  }

  /// Whether this user has a bus assigned to them
  bool get hasBusAssigned => assignedBusId != null && assignedBusId!.isNotEmpty;

  /// Display string for the assigned bus
  String get assignedBusDisplay {
    if (!hasBusAssigned) return 'No bus assigned';
    if (assignedBusName != null && assignedBusNumber != null) {
      return '$assignedBusName ($assignedBusNumber)';
    }
    return assignedBusId ?? 'Unknown';
  }
}
