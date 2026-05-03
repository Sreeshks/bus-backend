import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../data/models/ticket_model.dart';
import '../viewmodels/providers.dart';

class MasterDataPage extends ConsumerStatefulWidget {
  const MasterDataPage({super.key});

  @override
  ConsumerState<MasterDataPage> createState() => _MasterDataPageState();
}

class _MasterDataPageState extends ConsumerState<MasterDataPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DarkScreenScaffold(
      appBar: AppBar(
        title: const Text(
          'Master Data',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.gold,
          labelColor: AppColors.goldLight,
          unselectedLabelColor: AppColors.textSecondary,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Locations'),
            Tab(text: 'Fares'),
            Tab(text: 'Routes'),
            Tab(text: 'Pay Modes'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _LocationsView(),
          _FaresView(),
          _RoutesView(),
          _PayModesView(),
        ],
      ),
    );
  }
}

// ── Locations ────────────────────────────────────────────────────────────────

class _LocationsView extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locsAsync = ref.watch(locationsProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(locationsProvider.future),
        color: AppColors.gold,
        child: locsAsync.when(
          data: (locs) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: locs.length,
            itemBuilder: (context, index) {
              final loc = locs[index];
              return _buildListCard(
                title: loc.name,
                subtitle: loc.code,
                icon: Icons.location_on_rounded,
                iconColor: AppColors.indigo,
                onEdit: () => _showLocDialog(context, ref, loc: loc),
                onDelete: () => _deleteLoc(context, ref, loc.id),
              );
            },
          ),
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.gold),
          ),
          error: (e, _) => Center(
            child: Text(
              'Error: $e',
              style: const TextStyle(color: AppColors.error),
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        mini: true,
        onPressed: () => _showLocDialog(context, ref),
        backgroundColor: AppColors.gold,
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  void _deleteLoc(BuildContext context, WidgetRef ref, String id) async {
    final confirmed = await _showConfirm(context, 'Delete this location?');
    if (confirmed == true) {
      try {
        await ref.read(ticketRepositoryProvider).deleteLocation(id);
        ref.invalidate(locationsProvider);
      } catch (e) {
        if (context.mounted)
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  void _showLocDialog(BuildContext context, WidgetRef ref, {Location? loc}) {
    final isEdit = loc != null;
    final nameCtrl = TextEditingController(text: loc?.name);
    final codeCtrl = TextEditingController(text: loc?.code);
    bool isLoading = false;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return _ManagementSheet(
            title: isEdit ? 'Edit Location' : 'Add Location',
            children: [
              DarkTextField(
                controller: nameCtrl,
                hint: 'Place Name',
                prefixIcon: Icons.map_outlined,
              ),
              const SizedBox(height: 16),
              DarkTextField(
                controller: codeCtrl,
                hint: 'Station Code',
                prefixIcon: Icons.tag_rounded,
              ),
              const SizedBox(height: 32),
              isLoading
                  ? const LoadingButton()
                  : GoldButton(
                      onTap: () async {
                        if (nameCtrl.text.isEmpty) return;
                        setModalState(() => isLoading = true);
                        try {
                          if (isEdit) {
                            await ref
                                .read(ticketRepositoryProvider)
                                .updateLocation(loc.id, nameCtrl.text, codeCtrl.text);
                          } else {
                            await ref
                                .read(ticketRepositoryProvider)
                                .addLocation(nameCtrl.text, codeCtrl.text);
                          }
                          ref.invalidate(locationsProvider);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text(isEdit ? 'Location Updated!' : 'Location Added!'),
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
                      label: isEdit ? 'SAVE CHANGES' : 'ADD STATION',
                      icon: isEdit ? Icons.save_rounded : Icons.add_location_alt_rounded,
                    ),
            ],
          );
        },
      ),
    );
  }
}

// ── Fares ───────────────────────────────────────────────────────────────────

class _FaresView extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final faresAsync = ref.watch(faresProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(faresProvider.future),
        color: AppColors.gold,
        child: faresAsync.when(
          data: (fares) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: fares.length,
            itemBuilder: (context, index) {
              final fare = fares[index];
              return _buildListCard(
                title: '${fare.source} → ${fare.destination}',
                subtitle: '₹${fare.amount.toStringAsFixed(2)}',
                icon: Icons.payments_rounded,
                iconColor: AppColors.success,
                onEdit: () => _showFareDialog(context, ref, fare: fare),
                onDelete: () => _deleteFare(context, ref, fare.id),
              );
            },
          ),
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.gold),
          ),
          error: (e, _) => Center(
            child: Text(
              'Error: $e',
              style: const TextStyle(color: AppColors.error),
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        mini: true,
        onPressed: () => _showFareDialog(context, ref),
        backgroundColor: AppColors.gold,
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  void _deleteFare(BuildContext context, WidgetRef ref, String id) async {
    final confirmed = await _showConfirm(context, 'Delete this fare?');
    if (confirmed == true) {
      try {
        await ref.read(ticketRepositoryProvider).deleteFare(id);
        ref.invalidate(faresProvider);
      } catch (e) {
        if (context.mounted)
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  void _showFareDialog(BuildContext context, WidgetRef ref, {Fare? fare}) {
    final isEdit = fare != null;
    final sourceCtrl = TextEditingController(text: fare?.source);
    final destCtrl = TextEditingController(text: fare?.destination);
    final amountCtrl = TextEditingController(text: fare?.amount.toString());
    final locations = ref.read(locationsProvider).value ?? [];

    bool isLoading = false;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return _ManagementSheet(
            title: isEdit ? 'Edit Fare' : 'Set Fare',
            children: [
              GestureDetector(
                onTap: isEdit ? null : () => _showLocationPicker(context, locations, (val) {
                  setModalState(() => sourceCtrl.text = val);
                }),
                child: AbsorbPointer(
                  absorbing: !isEdit,
                  child: DarkTextField(
                    controller: sourceCtrl,
                    hint: 'Source Station',
                    prefixIcon: Icons.logout_rounded,
                    enabled: !isEdit,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              GestureDetector(
                onTap: isEdit ? null : () => _showLocationPicker(context, locations, (val) {
                  setModalState(() => destCtrl.text = val);
                }),
                child: AbsorbPointer(
                  absorbing: !isEdit,
                  child: DarkTextField(
                    controller: destCtrl,
                    hint: 'Destination Station',
                    prefixIcon: Icons.login_rounded,
                    enabled: !isEdit,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              DarkTextField(
                controller: amountCtrl,
                hint: 'Fare Amount (₹)',
                keyboardType: TextInputType.number,
                prefixIcon: Icons.currency_rupee_rounded,
              ),
              const SizedBox(height: 32),
              isLoading
                  ? const LoadingButton()
                  : GoldButton(
                      onTap: () async {
                        if (sourceCtrl.text.isEmpty ||
                            destCtrl.text.isEmpty ||
                            amountCtrl.text.isEmpty) return;
                        setModalState(() => isLoading = true);
                        try {
                          await ref.read(ticketRepositoryProvider).updateFare(
                                sourceCtrl.text,
                                destCtrl.text,
                                double.parse(amountCtrl.text),
                              );
                          ref.invalidate(faresProvider);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text(isEdit ? 'Fare Updated!' : 'Fare Set!'),
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
                      label: isEdit ? 'SAVE CHANGES' : 'SAVE FARE',
                      icon: Icons.save_rounded,
                    ),
            ],
          );
        },
      ),
    );
  }
}

// ── Routes ──────────────────────────────────────────────────────────────────

class _RoutesView extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final routesAsync = ref.watch(routesProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(routesProvider.future),
        color: AppColors.gold,
        child: routesAsync.when(
          data: (routes) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: routes.length,
            itemBuilder: (context, index) {
              final r = routes[index];
              return _buildListCard(
                title: r.name,
                subtitle:
                    '${r.stops.length} stops: ${r.stops.take(3).join(', ')}...',
                icon: Icons.navigation_rounded,
                iconColor: AppColors.gold,
                onEdit: () => _showRouteDialog(context, ref, route: r),
                onDelete: () => _deleteRoute(context, ref, r.id),
              );
            },
          ),
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.gold),
          ),
          error: (e, _) => Center(
            child: Text(
              'Error: $e',
              style: const TextStyle(color: AppColors.error),
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        mini: true,
        onPressed: () => _showRouteDialog(context, ref),
        backgroundColor: AppColors.gold,
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  void _deleteRoute(BuildContext context, WidgetRef ref, String id) async {
    final confirmed = await _showConfirm(context, 'Delete this route?');
    if (confirmed == true) {
      try {
        await ref.read(ticketRepositoryProvider).deleteRoute(id);
        ref.invalidate(routesProvider);
      } catch (e) {
        if (context.mounted)
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  void _showRouteDialog(BuildContext context, WidgetRef ref, {BusRoute? route}) {
    final isEdit = route != null;
    final nameCtrl = TextEditingController(text: route?.name);
    final stopsCtrl = TextEditingController(text: route?.stops.join(', '));
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return _ManagementSheet(
            title: isEdit ? 'Edit Route' : 'New Route',
            children: [
              DarkTextField(
                controller: nameCtrl,
                hint: 'Route Name (e.g. City Circular)',
                prefixIcon: Icons.route_rounded,
              ),
              const SizedBox(height: 16),
              DarkTextField(
                controller: stopsCtrl,
                hint: 'Stops (comma separated)',
                prefixIcon: Icons.list_alt_rounded,
              ),
              const SizedBox(height: 32),
              isLoading
                  ? const LoadingButton()
                  : GoldButton(
                      onTap: () async {
                        if (nameCtrl.text.isEmpty || stopsCtrl.text.isEmpty) return;
                        setModalState(() => isLoading = true);
                        final stops = stopsCtrl.text
                            .split(',')
                            .map((s) => s.trim())
                            .where((s) => s.isNotEmpty)
                            .toList();
                        try {
                          if (isEdit) {
                            await ref.read(ticketRepositoryProvider).updateRoute(route.id, {
                              'name': nameCtrl.text.trim(),
                              'stops': stops,
                            });
                          } else {
                            await ref
                                .read(ticketRepositoryProvider)
                                .createRoute(nameCtrl.text, stops, null);
                          }
                          ref.invalidate(routesProvider);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text(isEdit ? 'Route Updated!' : 'Route Created!'),
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
                      label: isEdit ? 'SAVE CHANGES' : 'CREATE ROUTE',
                      icon: Icons.save_rounded,
                    ),
            ],
          );
        },
      ),
    );
  }
}

// ── Pay Modes ───────────────────────────────────────────────────────────────

class _PayModesView extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pmAsync = ref.watch(payModesProvider);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(payModesProvider.future),
        color: AppColors.gold,
        child: pmAsync.when(
          data: (modes) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: modes.length,
            itemBuilder: (context, index) {
              final pm = modes[index];
              return _buildListCard(
                title: pm.name,
                subtitle: 'Icon: ${pm.icon}',
                icon: Icons.credit_card_rounded,
                iconColor: _parseColor(pm.color),
                onEdit: () => _showPmDialog(context, ref, pm: pm),
                onDelete: () => _deletePm(context, ref, pm.id),
              );
            },
          ),
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.gold),
          ),
          error: (e, _) => Center(
            child: Text(
              'Error: $e',
              style: const TextStyle(color: AppColors.error),
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        mini: true,
        onPressed: () => _showPmDialog(context, ref),
        backgroundColor: AppColors.gold,
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  void _deletePm(BuildContext context, WidgetRef ref, String id) async {
    final confirmed = await _showConfirm(context, 'Delete this payment mode?');
    if (confirmed == true) {
      try {
        await ref.read(ticketRepositoryProvider).deletePayMode(id);
        ref.invalidate(payModesProvider);
      } catch (e) {
        if (context.mounted)
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  void _showPmDialog(BuildContext context, WidgetRef ref, {PayMode? pm}) {
    final isEdit = pm != null;
    final nameCtrl = TextEditingController(text: pm?.name);
    final iconCtrl = TextEditingController(text: pm?.icon ?? 'payments');
    final colorCtrl = TextEditingController(text: pm?.color ?? '#D4952A');
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return _ManagementSheet(
            title: isEdit ? 'Edit Payment Mode' : 'Add Payment Mode',
            children: [
              DarkTextField(
                controller: nameCtrl,
                hint: 'Mode Name',
                prefixIcon: Icons.type_specimen_rounded,
              ),
              const SizedBox(height: 16),
              DarkTextField(
                controller: iconCtrl,
                hint: 'Icon Name',
                prefixIcon: Icons.palette_rounded,
              ),
              const SizedBox(height: 16),
              DarkTextField(
                controller: colorCtrl,
                hint: 'Hex Color (#...)',
                prefixIcon: Icons.color_lens_rounded,
              ),
              const SizedBox(height: 32),
              isLoading
                  ? const LoadingButton()
                  : GoldButton(
                      onTap: () async {
                        if (nameCtrl.text.isEmpty) return;
                        setModalState(() => isLoading = true);
                        try {
                          final pmData = {
                            'name': nameCtrl.text.trim(),
                            'icon': iconCtrl.text.trim(),
                            'color': colorCtrl.text.trim(),
                            'sortOrder': 0,
                          };

                          if (isEdit) {
                            await ref.read(ticketRepositoryProvider).updatePayMode(pm.id, pmData);
                          } else {
                            await ref.read(ticketRepositoryProvider).addPayMode(
                                pmData['name'] as String,
                                pmData['icon'] as String,
                                pmData['color'] as String,
                                pmData['sortOrder'] as int);
                          }

                          ref.invalidate(payModesProvider);
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                content: Text(isEdit ? 'Payment Mode Updated!' : 'Payment Mode Added!'),
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
                      label: isEdit ? 'SAVE CHANGES' : 'ADD MODE',
                      icon: isEdit ? Icons.save_rounded : Icons.add_card_rounded,
                    ),
            ],
          );
        },
      ),
    );
  }

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xff')));
    } catch (_) {
      return AppColors.gold;
    }
  }
}

// ── Shared UI Components ───────────────────────────────────────────────────────

Widget _buildListCard({
  required String title,
  required String subtitle,
  required IconData icon,
  required Color iconColor,
  required VoidCallback onDelete,
  VoidCallback? onEdit,
}) {
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
            color: iconColor.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        if (onEdit != null)
          IconButton(
            onPressed: onEdit,
            icon: const Icon(
              Icons.edit_note_rounded,
              color: AppColors.gold,
              size: 22,
            ),
          ),
        IconButton(
          onPressed: onDelete,
          icon: const Icon(
            Icons.delete_outline_rounded,
            color: AppColors.error,
            size: 20,
          ),
        ),
      ],
    ),
  );
}

class _ManagementSheet extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _ManagementSheet({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        24,
        24,
        24,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          ...children,
        ],
      ),
    );
  }
}

void _showLocationPicker(
  BuildContext context,
  List<Location> items,
  ValueChanged<String> onSelected,
) {
  final TextEditingController searchCtrl = TextEditingController();
  final FocusNode searchFocus = FocusNode();
  List<Location> filtered = List.from(items);

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => StatefulBuilder(
      builder: (context, setModalState) {
        return DraggableScrollableSheet(
          initialChildSize: 0.8,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          builder: (_, scrollController) => Container(
            decoration: const BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              children: [
                Center(
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                  child: TextField(
                    controller: searchCtrl,
                    focusNode: searchFocus,
                    autofocus: true,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 15,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Search station or code...',
                      hintStyle: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        color: AppColors.gold,
                        size: 20,
                      ),
                      filled: true,
                      fillColor: AppColors.fieldBg,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onChanged: (q) {
                      final query = q.trim().toLowerCase();
                      setModalState(() {
                        filtered = query.isEmpty
                            ? List.from(items)
                            : items
                                  .where(
                                    (l) =>
                                        l.name.toLowerCase().contains(query) ||
                                        l.code.toLowerCase().contains(query),
                                  )
                                  .toList();
                      });
                    },
                  ),
                ),
                Expanded(
                  child: filtered.isEmpty
                      ? const Center(
                          child: Text(
                            'No locations found',
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                        )
                      : ListView.separated(
                          controller: scrollController,
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 40),
                          itemCount: filtered.length,
                          separatorBuilder: (_, __) => Divider(
                            color: AppColors.border.withOpacity(0.4),
                            height: 1,
                          ),
                          itemBuilder: (context, index) {
                            final loc = filtered[index];
                            return ListTile(
                              title: Text(
                                loc.name,
                                style: const TextStyle(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Text(
                                loc.code,
                                style: const TextStyle(
                                  color: AppColors.gold,
                                  fontSize: 12,
                                ),
                              ),
                              onTap: () {
                                onSelected(loc.name);
                                Navigator.pop(context);
                              },
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        );
      },
    ),
  );
}

Future<bool?> _showConfirm(BuildContext context, String message) {
  return showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      backgroundColor: AppColors.card,
      title: const Text(
        'Confirm',
        style: TextStyle(color: AppColors.textPrimary),
      ),
      content: Text(
        message,
        style: const TextStyle(color: AppColors.textSecondary),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text(
            'Cancel',
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ),
        TextButton(
          onPressed: () => Navigator.pop(ctx, true),
          child: const Text('Delete', style: TextStyle(color: AppColors.error)),
        ),
      ],
    ),
  );
}
