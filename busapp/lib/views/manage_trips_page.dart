import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../data/models/ticket_model.dart';
import '../viewmodels/providers.dart';

class ManageTripsPage extends ConsumerWidget {
  const ManageTripsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tripsAsync = ref.watch(tripsProvider);

    return DarkScreenScaffold(
      appBar: AppBar(
        title: const Text('Manage Trips', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(tripsProvider.future),
        color: AppColors.gold,
        child: tripsAsync.when(
          data: (trips) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: trips.length,
            itemBuilder: (context, index) {
              final trip = trips[index];
              return _buildTripCard(context, ref, trip);
            },
          ),
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
          error: (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: AppColors.error))),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddTripDialog(context, ref),
        backgroundColor: AppColors.gold,
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  Widget _buildTripCard(BuildContext context, WidgetRef ref, Trip trip) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.directions_bus_rounded, color: AppColors.gold, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(trip.bus?.name ?? 'Unknown Bus', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
                    Text(trip.bus?.busNumber ?? '', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  ],
                ),
              ),
              Text('₹${trip.fare}', style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(color: AppColors.border, height: 1),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildTripPoint(trip.source, trip.departureTime),
              const Icon(Icons.arrow_forward_rounded, color: AppColors.textSecondary, size: 16),
              _buildTripPoint(trip.destination, trip.arrivalTime),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${trip.seatsAvailable} seats available', style: const TextStyle(color: AppColors.goldLight, fontSize: 11, fontWeight: FontWeight.bold)),
              IconButton(
                onPressed: () => _deleteTrip(context, ref, trip.id),
                icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTripPoint(String name, DateTime time) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(name, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14)),
        Text(DateFormat('MMM dd, hh:mm a').format(time), style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
      ],
    );
  }

  void _deleteTrip(BuildContext context, WidgetRef ref, String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('Cancel Trip', style: TextStyle(color: AppColors.textPrimary)),
        content: const Text('Are you sure you want to cancel this scheduled trip?', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No', style: TextStyle(color: AppColors.textSecondary))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes, Cancel', style: TextStyle(color: AppColors.error))),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await ref.read(ticketRepositoryProvider).deleteTrip(id);
        ref.invalidate(tripsProvider);
      } catch (e) {
        if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  void _showAddTripDialog(BuildContext context, WidgetRef ref) {
    final busesAsync = ref.watch(busesProvider);
    String? selectedBusId;
    final sourceCtrl = TextEditingController();
    final destCtrl = TextEditingController();
    final fareCtrl = TextEditingController();
    final seatsCtrl = TextEditingController();
    DateTime departure = DateTime.now().add(const Duration(hours: 1));
    DateTime arrival = DateTime.now().add(const Duration(hours: 4));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Schedule New Trip', style: TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                
                // Bus Dropdown
                busesAsync.when(
                  data: (buses) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(color: AppColors.fieldBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedBusId,
                        hint: const Text('Select Bus', style: TextStyle(color: AppColors.textSecondary)),
                        dropdownColor: AppColors.surface,
                        isExpanded: true,
                        items: buses.map((b) => DropdownMenuItem(value: b.id, child: Text('${b.name} (${b.busNumber})', style: const TextStyle(color: AppColors.textPrimary)))).toList(),
                        onChanged: (val) => setModalState(() => selectedBusId = val),
                      ),
                    ),
                  ),
                  loading: () => const LinearProgressIndicator(color: AppColors.gold),
                  error: (e, _) => Text('Error loading buses', style: const TextStyle(color: AppColors.error)),
                ),
                
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: DarkTextField(controller: sourceCtrl, hint: 'Source', prefixIcon: Icons.logout_rounded)),
                    const SizedBox(width: 12),
                    Expanded(child: DarkTextField(controller: destCtrl, hint: 'Destination', prefixIcon: Icons.login_rounded)),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Times
                Row(
                  children: [
                    Expanded(
                      child: _buildTimePicker(context, 'Departure', departure, (newTime) => setModalState(() => departure = newTime)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildTimePicker(context, 'Arrival', arrival, (newTime) => setModalState(() => arrival = newTime)),
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: DarkTextField(controller: fareCtrl, hint: 'Fare (₹)', keyboardType: TextInputType.number, prefixIcon: Icons.currency_rupee_rounded)),
                    const SizedBox(width: 12),
                    Expanded(child: DarkTextField(controller: seatsCtrl, hint: 'Seats', keyboardType: TextInputType.number, prefixIcon: Icons.people_rounded)),
                  ],
                ),
                
                const SizedBox(height: 32),
                GoldButton(
                  onTap: () async {
                    if (selectedBusId == null || sourceCtrl.text.isEmpty || destCtrl.text.isEmpty || fareCtrl.text.isEmpty) return;
                    try {
                      await ref.read(ticketRepositoryProvider).createTrip({
                        'busId': selectedBusId,
                        'source': sourceCtrl.text,
                        'destination': destCtrl.text,
                        'departureTime': departure.toIso8601String(),
                        'arrivalTime': arrival.toIso8601String(),
                        'fare': double.parse(fareCtrl.text),
                        'seatsAvailable': int.parse(seatsCtrl.text),
                      });
                      ref.invalidate(tripsProvider);
                      if (context.mounted) Navigator.pop(context);
                    } catch (e) {
                      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                    }
                  },
                  label: 'SCHEDULE TRIP',
                  icon: Icons.calendar_today_rounded,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTimePicker(BuildContext context, String label, DateTime current, Function(DateTime) onPicked) {
    return GestureDetector(
      onTap: () async {
        final date = await showDatePicker(context: context, initialDate: current, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
        if (date != null && context.mounted) {
          final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(current));
          if (time != null) {
            onPicked(DateTime(date.year, date.month, date.day, time.hour, time.minute));
          }
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(color: AppColors.fieldBg, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(DateFormat('MMM dd, hh:mm a').format(current), style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
