class Ticket {
  final String? id;
  final String ticketNumber;
  final String source;
  final String destination;
  final int adultCount;
  final int childCount;
  final double totalAmount;
  final String busId;
  final String payMode;
  final String createdAt;

  Ticket({
    this.id,
    required this.ticketNumber,
    required this.source,
    required this.destination,
    required this.adultCount,
    required this.childCount,
    required this.totalAmount,
    required this.busId,
    required this.payMode,
    required this.createdAt,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['_id'],
      ticketNumber: json['ticketNumber'] ?? 'UNK',
      source: json['source'] ?? '',
      destination: json['destination'] ?? '',
      adultCount: json['adultCount'] ?? 0,
      childCount: json['childCount'] ?? 0,
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      busId: (json['bus'] is Map)
          ? (json['bus']['name'] != null
                ? '${json['bus']['name']} (${json['bus']['busNumber']})'
                : json['bus']['_id'] ?? '')
          : (json['bus'] ?? ''),
      payMode: json['payMode'] ?? 'Cash',
      createdAt: json['createdAt'] ?? '',
    );
  }
}

class PayMode {
  final String id;
  final String name;
  final String icon;
  final String color;

  PayMode({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
  });

  factory PayMode.fromJson(Map<String, dynamic> json) {
    return PayMode(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      icon: json['icon'] ?? 'payments',
      color: json['color'] ?? '#D4952A',
    );
  }
}

class Bus {
  final String id;
  final String name;
  final String busNumber;

  Bus({required this.id, required this.name, required this.busNumber});

  factory Bus.fromJson(Map<String, dynamic> json) {
    return Bus(
      id: json['_id'],
      name: json['name'] ?? '',
      busNumber: json['busNumber'] ?? '',
    );
  }
}

class Location {
  final String id;
  final String name;
  final String code;

  Location({required this.id, required this.name, required this.code});

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      id: json['_id'],
      name: json['name'] ?? '',
      code: json['code'] ?? '',
    );
  }
}
