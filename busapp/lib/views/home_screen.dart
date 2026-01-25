import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../viewmodels/providers.dart';
import '../data/models/ticket_model.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  String? selectedBusId;
  String? selectedSource;
  String? selectedDestination;
  int adultCount = 1;
  int childCount = 0;
  bool issuing = false;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final locationsAsync = ref.watch(locationsProvider);
    final busesAsync = ref.watch(busesProvider);
    final ticketsAsync = ref.watch(ticketsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome, ${user?.name}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              Navigator.of(
                context,
              ).pushReplacementNamed('/'); // Assuming login route
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // BUS SELECTION
            busesAsync.when(
              data: (buses) {
                if (buses.isEmpty) return const Text('No buses available');
                // Auto select first
                if (selectedBusId == null && buses.isNotEmpty) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    setState(() => selectedBusId = buses.first.id);
                  });
                }
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: DropdownButtonFormField<String>(
                      value: selectedBusId,
                      decoration: const InputDecoration(
                        labelText: 'Select Bus',
                      ),
                      items: buses
                          .map(
                            (b) => DropdownMenuItem(
                              value: b.id,
                              child: Text('${b.name} (${b.busNumber})'),
                            ),
                          )
                          .toList(),
                      onChanged: (id) => setState(() => selectedBusId = id),
                    ),
                  ),
                );
              },
              loading: () => const LinearProgressIndicator(),
              error: (err, _) => Text('Error loading buses: $err'),
            ),

            const SizedBox(height: 16),
            const Text(
              'Issue Ticket',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // ROUTE & PAX
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: locationsAsync.when(
                  data: (locs) => Column(
                    children: [
                      DropdownButtonFormField<String>(
                        value: selectedSource,
                        decoration: const InputDecoration(labelText: 'From'),
                        items: locs
                            .map(
                              (l) => DropdownMenuItem(
                                value: l.name,
                                child: Text('${l.name} (${l.code})'),
                              ),
                            )
                            .toList(),
                        onChanged: (v) => setState(() => selectedSource = v),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: selectedDestination,
                        decoration: const InputDecoration(labelText: 'To'),
                        items: locs
                            .map(
                              (l) => DropdownMenuItem(
                                value: l.name,
                                child: Text('${l.name} (${l.code})'),
                              ),
                            )
                            .toList(),
                        onChanged: (v) =>
                            setState(() => selectedDestination = v),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: _buildCounter(
                              'Adults',
                              adultCount,
                              (v) => setState(() => adultCount = v),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildCounter(
                              'Children',
                              childCount,
                              (v) => setState(() => childCount = v),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton.icon(
                          onPressed: issuing ? null : _issueTicket,
                          icon: const Icon(Icons.print),
                          label: issuing
                              ? const Text('Processing...')
                              : const Text('ISSUE TICKET'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue[700],
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  loading: () => const CircularProgressIndicator(),
                  error: (err, _) => Text('Error: $err'),
                ),
              ),
            ),

            const SizedBox(height: 24),
            const Text(
              'Recent Tickets',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            ticketsAsync.when(
              data: (tickets) => ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: tickets.length,
                itemBuilder: (ctx, i) {
                  final t = tickets[i];
                  return Card(
                    child: ListTile(
                      leading: const Icon(Icons.confirmation_number_outlined),
                      title: Text(t.ticketNumber),
                      subtitle: Text('${t.source} -> ${t.destination}'),
                      trailing: Text(
                        '₹${t.totalAmount}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.green,
                        ),
                      ),
                    ),
                  );
                },
              ),
              loading: () => const SizedBox.shrink(),
              error: (e, _) => const Text('Failed to load history'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCounter(String label, int value, Function(int) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: () => onChanged(value > 0 ? value - 1 : 0),
                icon: const Icon(Icons.remove),
              ),
              Text(
                '$value',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                onPressed: () => onChanged(value + 1),
                icon: const Icon(Icons.add),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _issueTicket() async {
    if (selectedBusId == null ||
        selectedSource == null ||
        selectedDestination == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select bus and route')),
      );
      return;
    }

    setState(() => issuing = true);
    try {
      await ref
          .read(ticketRepositoryProvider)
          .issueTicket(
            busId: selectedBusId!,
            source: selectedSource!,
            destination: selectedDestination!,
            adultCount: adultCount,
            childCount: childCount,
          );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ticket Issued!'),
          backgroundColor: Colors.green,
        ),
      );
      ref.refresh(ticketsProvider); // Refresh list

      // Reset
      setState(() {
        adultCount = 1;
        childCount = 0;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => issuing = false);
    }
  }
}
