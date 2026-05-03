import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import '../core/api_client.dart';
import '../data/models/user_model.dart';
import '../data/models/ticket_model.dart';
import '../data/repositories/auth_repository.dart';
import '../data/repositories/ticket_repository.dart';

// Service Providers
final apiClientProvider = Provider((ref) => ApiClient());

final authRepositoryProvider = Provider((ref) {
  return AuthRepository(ref.watch(apiClientProvider));
});

final ticketRepositoryProvider = Provider((ref) {
  return TicketRepository(ref.watch(apiClientProvider));
});

// Auth State
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final user = await _repo.getSavedUser();
    if (user != null) {
      state = AuthState(user: user);
    }
  }

  Future<bool> register(String name, String email, String password) async {
    state = AuthState(isLoading: true);
    try {
      final user = await _repo.register(name, email, password);
      state = AuthState(user: user);
      return true;
    } catch (e) {
      state = AuthState(error: e.toString());
      return false;
    }
  }

  Future<bool> login(String email, String password) async {
    state = AuthState(isLoading: true);
    try {
      final user = await _repo.login(email, password);
      state = AuthState(user: user);
      return true;
    } catch (e) {
      state = AuthState(error: e.toString());
      return false;
    }
  }

  void logout() async {
    try {
      await _repo.logout();
    } finally {
      state = AuthState();
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(authRepositoryProvider));
});

// Data Providers
final locationsProvider = FutureProvider<List<Location>>((ref) async {
  return ref.read(ticketRepositoryProvider).getLocations();
});

final busesProvider = FutureProvider<List<Bus>>((ref) async {
  return ref.read(ticketRepositoryProvider).getBuses();
});

final ticketsProvider = FutureProvider<List<Ticket>>((ref) async {
  return ref.read(ticketRepositoryProvider).getMyTickets();
});

final dailyBillProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(ticketRepositoryProvider).getDailyBill();
});

final payModesProvider = FutureProvider<List<PayMode>>((ref) async {
  return ref.read(ticketRepositoryProvider).getPayModes();
});

final usersProvider = FutureProvider<List<User>>((ref) async {
  return ref.read(authRepositoryProvider).getUsers();
});

final faresProvider = FutureProvider<List<Fare>>((ref) async {
  return ref.read(ticketRepositoryProvider).getFares();
});

final routesProvider = FutureProvider<List<BusRoute>>((ref) async {
  return ref.read(ticketRepositoryProvider).getRoutes();
});

final dashboardStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(ticketRepositoryProvider).getDashboardStats();
});

final tripsProvider = FutureProvider<List<Trip>>((ref) async {
  return ref.read(ticketRepositoryProvider).getTrips();
});

final allTicketsProvider = FutureProvider<List<Ticket>>((ref) async {
  return ref.read(ticketRepositoryProvider).getAllTickets();
});
