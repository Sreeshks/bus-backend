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
  double? estimatedFare;
  bool loadingFare = false;

  void _checkFare() async {
    if (selectedSource != null && selectedDestination != null) {
      if (selectedSource == selectedDestination) {
        setState(() => estimatedFare = 0.0);
        return;
      }

      setState(() => loadingFare = true);
      try {
        final farePerAdult = await ref
            .read(ticketRepositoryProvider)
            .checkFare(selectedSource!, selectedDestination!);

        if (mounted) {
          final farePerChild = farePerAdult / 2; // Assuming half fare policy
          final total =
              (farePerAdult * adultCount) + (farePerChild * childCount);
          setState(() => estimatedFare = total);
        }
      } catch (e) {
        if (mounted) setState(() => estimatedFare = null);
      } finally {
        if (mounted) setState(() => loadingFare = false);
      }
    } else {
      if (mounted) setState(() => estimatedFare = null);
    }
  }

  // Effect: When dependencies change, calculate fare
  void _onSelectionChanged() {
    _checkFare();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final locationsAsync = ref.watch(locationsProvider);
    final busesAsync = ref.watch(busesProvider);
    final ticketsAsync = ref.watch(ticketsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFFF7ED), // Orange-50
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.directions_bus, color: Color(0xFFEA580C)),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Ente YATRA',
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    user?.name ?? 'Staff',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 12,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // SYNC BUTTON
          IconButton(
            icon: const Icon(
              Icons.cloud_upload_outlined,
              color: Color(0xFFEA580C),
            ),
            tooltip: 'Sync Offline Tickets',
            onPressed: _syncTickets,
          ),
          // DOWNLOAD BUTTON
          IconButton(
            icon: const Icon(
              Icons.download_for_offline_outlined,
              color: Colors.blueGrey,
            ),
            tooltip: 'Download Master Data',
            onPressed: _downloadData,
          ),
          IconButton(
            icon: Icon(Icons.logout, color: Colors.grey.shade600),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              Navigator.of(context).pushReplacementNamed('/');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(ticketsProvider);
          ref.invalidate(busesProvider);
          ref.invalidate(locationsProvider);
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // BUS SELECTOR
              busesAsync.when(
                data: (buses) {
                  if (buses.isEmpty) return const SizedBox.shrink();
                  // Auto select first
                  if (selectedBusId == null && buses.isNotEmpty) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      setState(() => selectedBusId = buses.first.id);
                    });
                  }

                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.orange.shade100),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        value: selectedBusId,
                        hint: const Text('Select Active Bus'),
                        icon: const Icon(
                          Icons.arrow_drop_down_circle_outlined,
                          color: Color(0xFFEA580C),
                        ),
                        items: buses
                            .map(
                              (b) => DropdownMenuItem(
                                value: b.id,
                                child: Text(
                                  '${b.name} (${b.busNumber})',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: (v) => setState(() => selectedBusId = v),
                      ),
                    ),
                  );
                },
                loading: () => const LinearProgressIndicator(),
                error: (e, __) => Text(
                  'Check internet or download data first.',
                  style: TextStyle(color: Colors.red.shade300, fontSize: 12),
                ),
              ),

              const SizedBox(height: 24),
              const Text(
                'Issue New Ticket',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 12),

              // TICKET FORM
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.orange.withOpacity(0.05),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: locationsAsync.when(
                  data: (locs) => Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: selectedSource,
                              decoration: const InputDecoration(
                                labelText: 'From',
                                prefixIcon: Icon(
                                  Icons.my_location,
                                  color: Color(0xFFEA580C),
                                ),
                              ),
                              items: locs
                                  .map(
                                    (l) => DropdownMenuItem(
                                      value: l.name,
                                      child: Text(l.name),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (v) {
                                setState(() => selectedSource = v);
                                _onSelectionChanged();
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: selectedDestination,
                              decoration: const InputDecoration(
                                labelText: 'To',
                                prefixIcon: Icon(
                                  Icons.location_on,
                                  color: Colors.red,
                                ),
                              ),
                              items: locs
                                  .map(
                                    (l) => DropdownMenuItem(
                                      value: l.name,
                                      child: Text(l.name),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (v) {
                                setState(() => selectedDestination = v);
                                _onSelectionChanged();
                              },
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: _buildCounter('Adults', adultCount, (v) {
                                setState(() => adultCount = v);
                                _onSelectionChanged();
                              }),
                            ),
                            Container(
                              width: 1,
                              height: 40,
                              color: Colors.grey.shade300,
                              margin: const EdgeInsets.symmetric(
                                horizontal: 16,
                              ),
                            ),
                            Expanded(
                              child: _buildCounter('Children', childCount, (v) {
                                setState(() => childCount = v);
                                _onSelectionChanged();
                              }),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // ESTIMATED FARE
                      if (loadingFare)
                        const Center(child: CircularProgressIndicator())
                      else if (estimatedFare != null && estimatedFare! > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            vertical: 12,
                            horizontal: 24,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.orange.shade100),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Estimated Fare',
                                style: TextStyle(
                                  color: Color(0xFFEA580C),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                '₹${estimatedFare!.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  color: Color(0xFFEA580C),
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),

                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed:
                              (issuing ||
                                  estimatedFare == null ||
                                  estimatedFare == 0)
                              ? null
                              : _issueTicket,
                          icon: const Icon(Icons.print_rounded),
                          label: issuing
                              ? const Text('Processing...')
                              : const Text(
                                  'PRINT TICKET',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                  ),
                                ),
                          style: ElevatedButton.styleFrom(
                            elevation: 4,
                            shadowColor: Colors.orange.withOpacity(0.4),
                          ),
                        ),
                      ),
                    ],
                  ),
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                  error: (e, _) => Center(
                    child: Text(
                      'Error. Try downloading data.',
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Recent Tickets',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'LIVE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.green.shade700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              ticketsAsync.when(
                data: (tickets) => ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: tickets.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (ctx, i) {
                    final t = tickets[i];
                    final isOffline = t.ticketNumber.startsWith('OFF');
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isOffline
                              ? Colors.orange.shade200
                              : Colors.grey.shade100,
                        ),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 8,
                        ),
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade50,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isOffline
                                ? Icons.cloud_off
                                : Icons.confirmation_number_outlined,
                            color: const Color(0xFFEA580C),
                          ),
                        ),
                        title: Text(
                          t.ticketNumber,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Row(
                          children: [
                            Text(
                              t.source,
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 4),
                              child: Icon(
                                Icons.arrow_right_alt,
                                size: 16,
                                color: Colors.grey,
                              ),
                            ),
                            Text(
                              t.destination,
                              style: const TextStyle(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '₹${t.totalAmount.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 18,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            if (isOffline)
                              const Text(
                                'Pending Sync',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.orange,
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                loading: () => const SizedBox(),
                error: (e, _) => const Text('Failed to load history'),
              ),
              const SizedBox(height: 50),
            ],
          ),
        ),
      ),
    );
  }

  // ... (Keep _buildCounter same as before) ...
  Widget _buildCounter(String label, int value, Function(int) onChanged) {
    return Column(
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade500,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            InkWell(
              onTap: () => onChanged(value > 0 ? value - 1 : 0),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: const Icon(Icons.remove, size: 16),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                '$value',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            InkWell(
              onTap: () => onChanged(value + 1),
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: const Icon(
                  Icons.add,
                  size: 16,
                  color: Color(0xFFEA580C),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _downloadData() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          double progress = 0;
          String status = "Starting download...";

          // Trigger download
          ref
              .read(ticketRepositoryProvider)
              .downloadMasterData((p) {
                if (context.mounted) {
                  setDialogState(() {
                    progress = p / 100;
                    status = "Downloading data... $p%";
                  });
                }
              })
              .then((_) {
                if (context.mounted) Navigator.pop(context);
                ref.invalidate(locationsProvider);
                ref.invalidate(busesProvider);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Offline Data Downloaded!")),
                );
              })
              .catchError((e) {
                if (context.mounted) Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text("Download failed: $e"),
                    backgroundColor: Colors.red,
                  ),
                );
              });

          return AlertDialog(
            title: const Text("Downloading Master Data"),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.orange.shade100,
                  color: const Color(0xFFEA580C),
                ),
                const SizedBox(height: 16),
                Text(status),
              ],
            ),
          );
        },
      ),
    );
  }

  void _syncTickets() async {
    try {
      await ref.read(ticketRepositoryProvider).syncPendingTickets();
      ref.invalidate(ticketsProvider);
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Sync Complete!"),
            backgroundColor: Colors.green,
          ),
        );
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Sync Error: $e"),
            backgroundColor: Colors.red,
          ),
        );
    }
  }

  void _issueTicket() async {
    if (selectedBusId == null || estimatedFare == null) return;

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
            totalAmount: estimatedFare!,
          );

      // Success Feedback
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 8),
                Text('Ticket Printed Successfully!'),
              ],
            ),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }

      ref.invalidate(ticketsProvider);

      // Reset
      setState(() {
        adultCount = 1;
        childCount = 0;
        estimatedFare = null;
        // Keep source/dest as conductor usually issues multiple tickets for same route or close by
      });
      // Re-calculate estimates if needed or just clear
      _checkFare();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => issuing = false);
    }
  }
}
