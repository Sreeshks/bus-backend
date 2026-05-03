import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../data/models/ticket_model.dart';
import '../viewmodels/providers.dart';

class ManageBusesPage extends ConsumerWidget {
  const ManageBusesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final busesAsync = ref.watch(busesProvider);

    return DarkScreenScaffold(
      appBar: AppBar(
        title: const Text('Manage Fleet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(busesProvider.future),
        color: AppColors.gold,
        child: busesAsync.when(
          data: (buses) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: buses.length,
            itemBuilder: (context, index) {
              final bus = buses[index];
              return _buildBusCard(context, ref, bus);
            },
          ),
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
          error: (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: AppColors.error))),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showBusDialog(context, ref),
        backgroundColor: AppColors.gold,
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  Widget _buildBusCard(BuildContext context, WidgetRef ref, Bus bus) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.gold.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.directions_bus_rounded, color: AppColors.gold, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  bus.name,
                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  bus.busNumber,
                  style: const TextStyle(color: AppColors.goldLight, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
                Text(
                  '${bus.capacity} Seats • ${bus.type}',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _showBusDialog(context, ref, bus: bus),
            icon: const Icon(Icons.edit_note_rounded, color: AppColors.gold, size: 24),
          ),
        ],
      ),
    );
  }

  void _showBusDialog(BuildContext context, WidgetRef ref, {Bus? bus}) {
    final isEdit = bus != null;
    final nameCtrl = TextEditingController(text: bus?.name);
    final numberCtrl = TextEditingController(text: bus?.busNumber);
    final capacityCtrl = TextEditingController(text: isEdit ? bus.capacity.toString() : '40');
    final operatorCtrl = TextEditingController(text: bus?.operatorName);
    String busType = bus?.type ?? 'Non-AC';

    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
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
                  Text(isEdit ? 'Edit Bus' : 'Add New Bus',
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  DarkTextField(controller: nameCtrl, hint: 'Bus Name (e.g. Rapid X)', prefixIcon: Icons.badge_outlined),
                  const SizedBox(height: 16),
                  DarkTextField(
                      controller: numberCtrl, hint: 'Bus Number (e.g. KL-01-AB-1234)', prefixIcon: Icons.tag_rounded),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                          child: DarkTextField(
                              controller: capacityCtrl,
                              hint: 'Capacity',
                              keyboardType: TextInputType.number,
                              prefixIcon: Icons.event_seat_rounded)),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                              color: AppColors.fieldBg,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.border)),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: busType,
                              dropdownColor: AppColors.surface,
                              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                              items: ['AC', 'Non-AC', 'Sleeper', 'Seater', 'Semi-Sleeper']
                                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                                  .toList(),
                              onChanged: (v) => setModalState(() => busType = v!),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  DarkTextField(controller: operatorCtrl, hint: 'Operator Name', prefixIcon: Icons.business_rounded),
                  const SizedBox(height: 32),
                  isLoading
                      ? const LoadingButton()
                      : GoldButton(
                          onTap: () async {
                            if (nameCtrl.text.isEmpty ||
                                numberCtrl.text.isEmpty ||
                                capacityCtrl.text.isEmpty ||
                                operatorCtrl.text.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
                              return;
                            }
                            setModalState(() => isLoading = true);
                            try {
                              final busData = {
                                'name': nameCtrl.text.trim(),
                                'busNumber': numberCtrl.text.trim(),
                                'capacity': int.parse(capacityCtrl.text),
                                'type': busType,
                                'operatorName': operatorCtrl.text.trim(),
                              };

                              if (isEdit) {
                                await ref.read(ticketRepositoryProvider).updateBus(bus.id, busData);
                              } else {
                                await ref.read(ticketRepositoryProvider).createBus(
                                      name: busData['name'] as String,
                                      busNumber: busData['busNumber'] as String,
                                      capacity: busData['capacity'] as int,
                                      type: busData['type'] as String,
                                      operatorName: busData['operatorName'] as String,
                                    );
                              }

                              ref.invalidate(busesProvider);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                    content: Text(isEdit ? 'Bus Updated Successfully!' : 'Bus Registered Successfully!'),
                                    backgroundColor: AppColors.success));
                                Navigator.pop(context);
                              }
                            } catch (e) {
                              setModalState(() => isLoading = false);
                              if (context.mounted)
                                ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error));
                            }
                          },
                          label: isEdit ? 'SAVE CHANGES' : 'REGISTER BUS',
                          icon: isEdit ? Icons.save_rounded : Icons.add_rounded,
                        ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
