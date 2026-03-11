import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../viewmodels/providers.dart';

class IssueTicketTab extends ConsumerStatefulWidget {
  const IssueTicketTab({super.key});

  @override
  ConsumerState<IssueTicketTab> createState() => _IssueTicketTabState();
}

class _IssueTicketTabState extends ConsumerState<IssueTicketTab> {
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

  void _onSelectionChanged() {
    _checkFare();
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
            backgroundColor: Color(0xFF10B981), // Emerald
            behavior: SnackBarBehavior.floating,
          ),
        );
      }

      ref.invalidate(ticketsProvider);
      ref.invalidate(dailyBillProvider);

      setState(() {
        adultCount = 1;
        childCount = 0;
        estimatedFare = null;
      });
      _checkFare();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()), 
            backgroundColor: const Color(0xFFEF4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => issuing = false);
    }
  }

  void _swapLocations() {
    if (selectedSource != null || selectedDestination != null) {
      setState(() {
        final temp = selectedSource;
        selectedSource = selectedDestination;
        selectedDestination = temp;
      });
      _checkFare();
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final locationsAsync = ref.watch(locationsProvider);
    final busesAsync = ref.watch(busesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ente Yatra Terminal',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              user?.name ?? 'Staff',
              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.cloud_download_outlined, color: Color(0xFFEA580C)),
            tooltip: 'Download Offline Data',
            onPressed: _downloadData,
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFF64748B)),
            tooltip: 'Logout',
            onPressed: () {
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(busesProvider);
          ref.invalidate(locationsProvider);
        },
        color: const Color(0xFFEA580C),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Bus Selector Card
              const Text('Active Bus', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              const SizedBox(height: 8),
              busesAsync.when(
                data: (buses) {
                  if (buses.isEmpty) return const Text('No buses available', style: TextStyle(color: Colors.red));
                  if (selectedBusId == null) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      if (mounted) setState(() => selectedBusId = buses.first.id);
                    });
                  }
                  return Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        isExpanded: true,
                        value: selectedBusId,
                        icon: const Icon(Icons.directions_bus_rounded, color: Color(0xFFEA580C)),
                        items: buses.map((b) => DropdownMenuItem(
                          value: b.id,
                          child: Text('${b.name} (${b.busNumber})', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                        )).toList(),
                        onChanged: (v) => setState(() => selectedBusId = v),
                      ),
                    ),
                  );
                },
                loading: () => const LinearProgressIndicator(color: Color(0xFFEA580C)),
                error: (e, _) => const Text('Error loading buses', style: TextStyle(color: Colors.red)),
              ),

              const SizedBox(height: 32),

              // Route Selection Card
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24),
                child: locationsAsync.when(
                  data: (locs) => Column(
                    children: [
                      DropdownButtonFormField<String>(
                        value: selectedSource,
                        decoration: InputDecoration(
                          labelText: 'From Location',
                          prefixIcon: const Icon(Icons.trip_origin_rounded, color: Color(0xFF3B82F6)), // Blue
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        items: locs.map((l) => DropdownMenuItem(value: l.name, child: Text(l.name))).toList(),
                        onChanged: (v) {
                          setState(() => selectedSource = v);
                          _onSelectionChanged();
                        },
                      ),
                      
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(width: 40, height: 1, color: const Color(0xFFE2E8F0)),
                            Container(
                              margin: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.swap_vert_rounded, color: Color(0xFF64748B)),
                                onPressed: _swapLocations,
                              ),
                            ),
                            Container(width: 40, height: 1, color: const Color(0xFFE2E8F0)),
                          ],
                        ),
                      ),

                      DropdownButtonFormField<String>(
                        value: selectedDestination,
                        decoration: InputDecoration(
                          labelText: 'To Location',
                          prefixIcon: const Icon(Icons.location_on_rounded, color: Color(0xFFEF4444)), // Red
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        items: locs.map((l) => DropdownMenuItem(value: l.name, child: Text(l.name))).toList(),
                        onChanged: (v) {
                          setState(() => selectedDestination = v);
                          _onSelectionChanged();
                        },
                      ),
                    ],
                  ),
                  loading: () => const Center(child: CircularProgressIndicator(color: Color(0xFFEA580C))),
                  error: (e, _) => const Center(child: Text('Error loading locations', style: TextStyle(color: Colors.red))),
                ),
              ),

              const SizedBox(height: 24),

              // Passengers Card
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.03),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildCounter('ADULT', adultCount, (v) {
                        setState(() => adultCount = v);
                        _onSelectionChanged();
                      }),
                    ),
                    Container(
                      width: 1,
                      height: 50,
                      color: const Color(0xFFE2E8F0),
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    Expanded(
                      child: _buildCounter('CHILD', childCount, (v) {
                        setState(() => childCount = v);
                        _onSelectionChanged();
                      }),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Estimated Fare
              if (loadingFare)
                const Center(child: CircularProgressIndicator(color: Color(0xFFEA580C)))
              else if (estimatedFare != null && estimatedFare! > 0)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFF7ED), Color(0xFFFFEDD5)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFFDBA74)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Total Fare', style: TextStyle(color: Color(0xFFC2410C), fontWeight: FontWeight.bold, fontSize: 16)),
                          Text('Including all taxes', style: TextStyle(color: Color(0xFFEA580C), fontSize: 12)),
                        ],
                      ),
                      Text(
                        '₹${estimatedFare!.toStringAsFixed(0)}',
                        style: const TextStyle(
                          color: Color(0xFFEA580C),
                          fontSize: 36,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -1,
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 32),

              // Issue Ticket Button
              SizedBox(
                height: 64,
                child: ElevatedButton(
                  onPressed: (issuing || estimatedFare == null || estimatedFare == 0) ? null : _issueTicket,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFEA580C),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 10,
                    shadowColor: const Color(0xFFEA580C).withOpacity(0.5),
                  ),
                  child: issuing
                      ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.print_rounded, size: 28),
                            SizedBox(width: 12),
                            Text(
                              'PRINT TICKET',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCounter(String label, int value, Function(int) onChanged) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Color(0xFF64748B),
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            InkWell(
              onTap: () => onChanged(value > 0 ? value - 1 : 0),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.remove_rounded, color: Color(0xFF475569)),
              ),
            ),
            Text(
              '$value',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: Color(0xFF0F172A),
              ),
            ),
            InkWell(
              onTap: () => onChanged(value + 1),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF7ED),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFDBA74)),
                ),
                child: const Icon(Icons.add_rounded, color: Color(0xFFEA580C)),
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
                  const SnackBar(content: Text("Offline Data Downloaded!"), backgroundColor: Colors.green),
                );
              })
              .catchError((e) {
                if (context.mounted) Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("Download failed: $e"), backgroundColor: Colors.red),
                );
              });

          return AlertDialog(
            title: const Text("Downloading Master Data"),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.orange.shade100,
                  color: const Color(0xFFEA580C),
                  borderRadius: BorderRadius.circular(8),
                  minHeight: 8,
                ),
                const SizedBox(height: 16),
                Text(status, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF475569))),
              ],
            ),
          );
        },
      ),
    );
  }
}
