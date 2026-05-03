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

class BusRoute {
  final String id;
  final String name;
  final List<String> stops;
  final String? description;

  BusRoute({
    required this.id,
    required this.name,
    required this.stops,
    this.description,
  });

  factory BusRoute.fromJson(Map<String, dynamic> json) {
    return BusRoute(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      stops: List<String>.from(json['stops'] ?? []),
      description: json['description'],
    );
  }
}

class Fare {
  final String id;
  final String source;
  final String destination;
  final double amount;

  Fare({
    required this.id,
    required this.source,
    required this.destination,
    required this.amount,
  });

  factory Fare.fromJson(Map<String, dynamic> json) {
    return Fare(
      id: json['_id'] ?? '',
      source: json['source'] ?? '',
      destination: json['destination'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
    );
  }
}

class Trip {
  final String id;
  final Bus? bus;
  final String source;
  final String destination;
  final DateTime departureTime;
  final DateTime arrivalTime;
  final double fare;
  final int seatsAvailable;

  Trip({
    required this.id,
    this.bus,
    required this.source,
    required this.destination,
    required this.departureTime,
    required this.arrivalTime,
    required this.fare,
    required this.seatsAvailable,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['_id'] ?? '',
      bus: json['bus'] != null ? Bus.fromJson(json['bus']) : null,
      source: json['source'] ?? '',
      destination: json['destination'] ?? '',
      departureTime: DateTime.parse(json['departureTime']),
      arrivalTime: DateTime.parse(json['arrivalTime']),
      fare: (json['fare'] ?? 0).toDouble(),
      seatsAvailable: json['seatsAvailable'] ?? 0,
    );
  }
}
