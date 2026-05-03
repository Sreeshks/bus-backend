import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../data/models/ticket_model.dart';
import '../viewmodels/providers.dart';

class IssueTicketTab extends ConsumerStatefulWidget {
  const IssueTicketTab({super.key});

  @override
  ConsumerState<IssueTicketTab> createState() => _IssueTicketTabState();
}

class _IssueTicketTabState extends ConsumerState<IssueTicketTab>
    with SingleTickerProviderStateMixin {
  String? selectedSource;
  String? selectedDestination;
  int adultCount = 1;
  int childCount = 0;
  bool issuing = false;
  double? estimatedFare;
  bool loadingFare = false;
  String selectedPayMode = 'Cash';

  late AnimationController _fareAnimController;
  late Animation<double> _fareAnim;

  @override
  void initState() {
    super.initState();
    _fareAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _fareAnim = CurvedAnimation(
      parent: _fareAnimController,
      curve: Curves.easeOutBack,
    );
  }

  @override
  void dispose() {
    _fareAnimController.dispose();
    super.dispose();
  }

  // ── Fare logic ─────────────────────────────────────────────────────────────

  void _checkFare() async {
    if (selectedSource != null && selectedDestination != null) {
      if (selectedSource == selectedDestination) {
        setState(() => estimatedFare = 0.0);
        _fareAnimController.forward(from: 0);
        return;
      }
      setState(() => loadingFare = true);
      try {
        final farePerAdult = await ref
            .read(ticketRepositoryProvider)
            .checkFare(selectedSource!, selectedDestination!);
        if (mounted) {
          final farePerChild = farePerAdult / 2;
          final total =
              (farePerAdult * adultCount) + (farePerChild * childCount);
          setState(() => estimatedFare = total);
          _fareAnimController.forward(from: 0);
        }
      } catch (e) {
        if (mounted) setState(() => estimatedFare = null);
      } finally {
        if (mounted) setState(() => loadingFare = false);
      }
    } else {
      if (mounted) {
        setState(() => estimatedFare = null);
        _fareAnimController.reverse();
      }
    }
  }

  void _onSelectionChanged() => _checkFare();

  void _issueTicket() async {
    final user = ref.read(authProvider).user;
    if (user == null || !user.hasBusAssigned || estimatedFare == null) return;

    setState(() => issuing = true);
    try {
      await ref
          .read(ticketRepositoryProvider)
          .issueTicket(
            busId: user.assignedBus!.id,
            source: selectedSource!,
            destination: selectedDestination!,
            adultCount: adultCount,
            childCount: childCount,
            totalAmount: estimatedFare!,
            payMode: selectedPayMode,
          );
      if (mounted) {
        _showSnack(
          'Ticket Printed Successfully!',
          AppColors.success,
          Icons.check_circle_rounded,
        );
      }
      ref.invalidate(ticketsProvider);
      ref.invalidate(dailyBillProvider);
      setState(() {
        adultCount = 1;
        childCount = 0;
        estimatedFare = null;
        selectedPayMode = 'Cash';
      });
      _fareAnimController.reverse();
      _checkFare();
    } catch (e) {
      if (mounted)
        _showSnack(e.toString(), AppColors.error, Icons.error_rounded);
    } finally {
      if (mounted) setState(() => issuing = false);
    }
  }

  void _showSnack(String msg, Color color, IconData icon) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                msg,
                style: const TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
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

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final locationsAsync = ref.watch(locationsProvider);
    final hasAssignment = user != null && user.hasBusAssigned;

    return DarkScreenScaffold(
      appBar: _buildAppBar(user, hasAssignment),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(locationsProvider);
            ref.invalidate(payModesProvider);
          },
          color: AppColors.gold,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildSectionLabel('ROUTE', Icons.route_rounded),
                const SizedBox(height: 8),
                _buildRouteCard(locationsAsync),

                const SizedBox(height: 16),

                _buildSectionLabel('PASSENGERS', Icons.people_alt_rounded),
                const SizedBox(height: 8),
                _buildPassengerCard(),

                const SizedBox(height: 16),

                _buildSectionLabel('PAYMENT', Icons.payment_rounded),
                const SizedBox(height: 8),
                _buildPaymentCard(),

                const SizedBox(height: 20),

                _buildFareAndAction(user, hasAssignment),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── AppBar ─────────────────────────────────────────────────────────────────

  PreferredSizeWidget _buildAppBar(dynamic user, bool hasAssignment) {
    return AppBar(
      backgroundColor: AppColors.surface,
      titleSpacing: 16,
      title: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.borderGold, width: 1),
            ),
            child: const Icon(
              Icons.confirmation_num_rounded,
              color: AppColors.gold,
              size: 18,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  user?.name ?? 'Conductor',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(
                      Icons.directions_bus_rounded,
                      size: 11,
                      color: hasAssignment ? AppColors.gold : AppColors.error,
                    ),
                    const SizedBox(width: 3),
                    Text(
                      hasAssignment
                          ? (user?.assignedBusDisplay ?? 'Assigned')
                          : 'No bus assigned',
                      style: TextStyle(
                        fontSize: 11,
                        color: hasAssignment
                            ? AppColors.goldLight
                            : AppColors.error,
                        fontWeight: FontWeight.w500,
                        height: 1.1,
                      ),
                    ),
                    if (hasAssignment) ...[
                      const SizedBox(width: 4),
                      Container(
                        width: 5,
                        height: 5,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(
            Icons.cloud_download_outlined,
            color: AppColors.gold,
            size: 20,
          ),
          tooltip: 'Download Offline Data',
          onPressed: _downloadData,
        ),
        IconButton(
          icon: const Icon(
            Icons.logout_rounded,
            color: AppColors.textSecondary,
            size: 20,
          ),
          tooltip: 'Logout',
          onPressed: () => ref.read(authProvider.notifier).logout(),
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  // ── Section label ──────────────────────────────────────────────────────────

  Widget _buildSectionLabel(String label, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 12, color: AppColors.gold),
        const SizedBox(width: 5),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: AppColors.gold,
            letterSpacing: 1.2,
          ),
        ),
      ],
    );
  }

  // ── Route card ─────────────────────────────────────────────────────────────

  Widget _buildRouteCard(AsyncValue locationsAsync) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: locationsAsync.when(
        data: (locs) {
          final List<Location> items = locs as List<Location>;
          return Column(
            children: [
              _buildSearchableSelector(
                value: selectedSource,
                label: 'From',
                icon: Icons.trip_origin_rounded,
                iconColor: AppColors.info,
                items: items,
                onChanged: (v) {
                  setState(() => selectedSource = v);
                  _onSelectionChanged();
                },
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(18),
                ),
              ),
              Container(
                height: 1,
                color: AppColors.border,
                child: Stack(
                  clipBehavior: Clip.none,
                  alignment: Alignment.center,
                  children: [
                    Positioned(
                      child: GestureDetector(
                        onTap: _swapLocations,
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: AppColors.fieldBg,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Icon(
                            Icons.swap_vert_rounded,
                            color: AppColors.textSecondary,
                            size: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              _buildSearchableSelector(
                value: selectedDestination,
                label: 'To',
                icon: Icons.location_on_rounded,
                iconColor: AppColors.error,
                items: items,
                onChanged: (v) {
                  setState(() => selectedDestination = v);
                  _onSelectionChanged();
                },
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(18),
                ),
              ),
            ],
          );
        },
        loading: () => const Padding(
          padding: EdgeInsets.all(24),
          child: Center(
            child: CircularProgressIndicator(
              color: AppColors.gold,
              strokeWidth: 2,
            ),
          ),
        ),
        error: (e, _) => const Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'Error loading locations',
            style: TextStyle(color: AppColors.error, fontSize: 13),
          ),
        ),
      ),
    );
  }

  Widget _buildSearchableSelector({
    required String? value,
    required String label,
    required IconData icon,
    required Color iconColor,
    required List<Location> items,
    required ValueChanged<String?> onChanged,
    required BorderRadius borderRadius,
  }) {
    String displayValue = 'Select Location';
    if (value != null) {
      try {
        final loc = items.firstWhere((l) => l.name == value);
        displayValue = '${loc.name} (${loc.code})';
      } catch (_) {
        displayValue = value;
      }
    }

    return InkWell(
      onTap: () => _showLocationSearch(label, items, onChanged),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: const BoxDecoration(color: AppColors.fieldBg),
          child: Row(
            children: [
              Icon(icon, color: iconColor, size: 18),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      displayValue,
                      style: TextStyle(
                        color: value != null
                            ? AppColors.textPrimary
                            : AppColors.textSecondary.withValues(alpha: 0.5),
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.keyboard_arrow_down_rounded,
                color: AppColors.textSecondary,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showLocationSearch(
    String title,
    List<Location> items,
    ValueChanged<String?> onSelected,
  ) {
    // Hoisted outside builder so they survive setModalState rebuilds
    final TextEditingController searchCtrl = TextEditingController();
    final FocusNode searchFocus = FocusNode();
    List<Location> filtered = List.from(items);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          // Request focus after the sheet animates in
          WidgetsBinding.instance.addPostFrameCallback((_) {
            searchFocus.requestFocus();
          });

          return WillPopScope(
            onWillPop: () async {
              searchCtrl.dispose();
              searchFocus.dispose();
              return true;
            },
            child: DraggableScrollableSheet(
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
                    // Drag handle
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
                    // Search field
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                      child: TextField(
                        controller: searchCtrl,
                        focusNode: searchFocus,
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
                          suffixIcon: AnimatedOpacity(
                            opacity: searchCtrl.text.isNotEmpty ? 1.0 : 0.0,
                            duration: const Duration(milliseconds: 150),
                            child: IconButton(
                              icon: const Icon(
                                Icons.cancel_rounded,
                                size: 18,
                                color: AppColors.textSecondary,
                              ),
                              onPressed: () {
                                searchCtrl.clear();
                                setModalState(
                                  () => filtered = List.from(items),
                                );
                                searchFocus.requestFocus();
                              },
                            ),
                          ),
                          filled: true,
                          fillColor: AppColors.fieldBg,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide.none,
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(
                              color: AppColors.gold,
                              width: 1.5,
                            ),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: 0,
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
                                            l.name.toLowerCase().contains(
                                              query,
                                            ) ||
                                            l.code.toLowerCase().contains(
                                              query,
                                            ),
                                      )
                                      .toList();
                          });
                        },
                      ),
                    ),
                    // Count label
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                      child: Row(
                        children: [
                          Text(
                            '${filtered.length} location${filtered.length != 1 ? 's' : ''}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: filtered.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.search_off_rounded,
                                    size: 36,
                                    color: AppColors.textSecondary.withValues(
                                      alpha: 0.3,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  const Text(
                                    'No locations found',
                                    style: TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : ListView.separated(
                              controller: scrollController,
                              padding: const EdgeInsets.fromLTRB(16, 0, 16, 40),
                              itemCount: filtered.length,
                              separatorBuilder: (_, __) => Divider(
                                color: AppColors.border.withValues(alpha: 0.4),
                                height: 1,
                                indent: 16,
                                endIndent: 16,
                              ),
                              itemBuilder: (context, index) {
                                final loc = filtered[index];
                                return InkWell(
                                  onTap: () {
                                    searchCtrl.dispose();
                                    searchFocus.dispose();
                                    onSelected(loc.name);
                                    Navigator.pop(context);
                                  },
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 12,
                                    ),
                                    child: Row(
                                      children: [
                                        Container(
                                          width: 38,
                                          height: 38,
                                          decoration: BoxDecoration(
                                            color: AppColors.gold.withValues(
                                              alpha: 0.08,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              loc.code.length > 3
                                                  ? loc.code.substring(0, 3)
                                                  : loc.code,
                                              style: const TextStyle(
                                                color: AppColors.gold,
                                                fontSize: 11,
                                                fontWeight: FontWeight.w800,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            loc.name,
                                            style: const TextStyle(
                                              color: AppColors.textPrimary,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14,
                                            ),
                                          ),
                                        ),
                                        const Icon(
                                          Icons.chevron_right_rounded,
                                          color: AppColors.textSecondary,
                                          size: 18,
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
                  ],
                ),
              ),
            ),
          ); // DraggableScrollableSheet / WillPopScope
        },
      ),
    );
  }

  // ── Passenger card ─────────────────────────────────────────────────────────

  Widget _buildPassengerCard() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildCompactCounter(
              label: 'Adult',
              sublabel: 'Full fare',
              value: adultCount,
              accentColor: AppColors.gold,
              onChanged: (v) {
                setState(() => adultCount = v);
                _onSelectionChanged();
              },
            ),
          ),
          Container(
            width: 1,
            height: 56,
            color: AppColors.border,
            margin: const EdgeInsets.symmetric(horizontal: 16),
          ),
          Expanded(
            child: _buildCompactCounter(
              label: 'Child',
              sublabel: 'Half fare',
              value: childCount,
              accentColor: AppColors.indigo,
              onChanged: (v) {
                setState(() => childCount = v);
                _onSelectionChanged();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactCounter({
    required String label,
    required String sublabel,
    required int value,
    required Color accentColor,
    required Function(int) onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              sublabel,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        Row(
          children: [
            _counterBtn(
              onTap: () => onChanged(value > 0 ? value - 1 : 0),
              icon: Icons.remove_rounded,
              active: false,
              accentColor: accentColor,
            ),
            SizedBox(
              width: 32,
              child: Text(
                '$value',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            _counterBtn(
              onTap: () => onChanged(value + 1),
              icon: Icons.add_rounded,
              active: true,
              accentColor: accentColor,
            ),
          ],
        ),
      ],
    );
  }

  Widget _counterBtn({
    required VoidCallback onTap,
    required IconData icon,
    required bool active,
    required Color accentColor,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: active
              ? accentColor.withValues(alpha: 0.12)
              : AppColors.fieldBg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active
                ? accentColor.withValues(alpha: 0.4)
                : AppColors.border,
          ),
        ),
        child: Icon(
          icon,
          size: 16,
          color: active ? accentColor : AppColors.textSecondary,
        ),
      ),
    );
  }

  // ── Payment card ───────────────────────────────────────────────────────────

  Widget _buildPaymentCard() {
    return ref
        .watch(payModesProvider)
        .when(
          data: (modes) {
            final displayModes = modes.isEmpty
                ? [
                    PayMode(
                      id: '1',
                      name: 'Cash',
                      icon: 'payments',
                      color: '#D4952A',
                    ),
                  ]
                : modes;

            return Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.border),
              ),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: displayModes.map((mode) {
                  final isSelected = selectedPayMode == mode.name;
                  final modeColor = _parseColor(mode.color);
                  return GestureDetector(
                    onTap: () => setState(() => selectedPayMode = mode.name),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? modeColor.withValues(alpha: 0.12)
                            : AppColors.fieldBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? modeColor : AppColors.border,
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _getIconData(mode.icon),
                            color: isSelected
                                ? modeColor
                                : AppColors.textSecondary,
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            mode.name,
                            style: TextStyle(
                              color: isSelected
                                  ? AppColors.textPrimary
                                  : AppColors.textSecondary,
                              fontWeight: isSelected
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            );
          },
          loading: () => const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(
                color: AppColors.gold,
                strokeWidth: 2,
              ),
            ),
          ),
          error: (e, _) => _buildDefaultPayModes(),
        );
  }

  // ── Fare + action ──────────────────────────────────────────────────────────

  Widget _buildFareAndAction(dynamic user, bool hasAssignment) {
    final canIssue =
        estimatedFare != null &&
        estimatedFare != 0 &&
        user != null &&
        hasAssignment;

    return Column(
      children: [
        if (loadingFare)
          Container(
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: const Center(
              child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  color: AppColors.gold,
                  strokeWidth: 2,
                ),
              ),
            ),
          )
        else if (estimatedFare != null && estimatedFare! > 0)
          ScaleTransition(
            scale: _fareAnim,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.gold.withValues(alpha: 0.10),
                    AppColors.goldDark.withValues(alpha: 0.06),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderGold),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Total Fare',
                        style: TextStyle(
                          color: AppColors.goldLight,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        '${adultCount > 0 ? '$adultCount adult' : ''}${adultCount > 0 && childCount > 0 ? ' · ' : ''}${childCount > 0 ? '$childCount child' : ''}',
                        style: const TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '₹${estimatedFare!.toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: AppColors.goldLight,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1,
                    ),
                  ),
                ],
              ),
            ),
          ),

        const SizedBox(height: 14),

        SizedBox(
          height: 54,
          child: issuing
              ? const LoadingButton()
              : GoldButton(
                  onTap: _issueTicket,
                  label: 'PRINT TICKET',
                  icon: Icons.print_rounded,
                  enabled: canIssue,
                ),
        ),

        if (!hasAssignment)
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(
                  Icons.info_outline_rounded,
                  color: AppColors.error,
                  size: 12,
                ),
                SizedBox(width: 4),
                Text(
                  'Contact admin to assign a bus',
                  style: TextStyle(
                    color: AppColors.error,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xff')));
    } catch (_) {
      return AppColors.gold;
    }
  }

  IconData _getIconData(String iconName) {
    const map = {
      'payments': Icons.payments_rounded,
      'credit_card': Icons.credit_card_rounded,
      'account_balance_wallet': Icons.account_balance_wallet_rounded,
      'qr_code': Icons.qr_code_scanner_rounded,
      'smartphone': Icons.smartphone_rounded,
      'receipt': Icons.receipt_long_rounded,
    };
    return map[iconName] ?? Icons.payments_rounded;
  }

  Widget _buildDefaultPayModes() {
    final modes = [
      {'name': 'Cash', 'icon': Icons.payments_rounded, 'color': AppColors.gold},
      {
        'name': 'Online',
        'icon': Icons.qr_code_scanner_rounded,
        'color': AppColors.indigo,
      },
    ];
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: modes.map((m) {
          final isSelected = selectedPayMode == m['name'];
          final c = m['color'] as Color;
          return Expanded(
            child: GestureDetector(
              onTap: () =>
                  setState(() => selectedPayMode = m['name'] as String),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected
                      ? c.withValues(alpha: 0.12)
                      : AppColors.fieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? c : AppColors.border,
                    width: isSelected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      m['icon'] as IconData,
                      color: isSelected ? c : AppColors.textSecondary,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      m['name'] as String,
                      style: TextStyle(
                        color: isSelected
                            ? AppColors.textPrimary
                            : AppColors.textSecondary,
                        fontWeight: isSelected
                            ? FontWeight.w700
                            : FontWeight.w500,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Download dialog ────────────────────────────────────────────────────────

  void _downloadData() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          double progress = 0;
          String status = 'Starting download...';

          ref
              .read(ticketRepositoryProvider)
              .downloadMasterData((p) {
                if (context.mounted) {
                  setDialogState(() {
                    progress = p / 100;
                    status = 'Downloading... $p%';
                  });
                }
              })
              .then((_) {
                if (!context.mounted) return;
                Navigator.pop(context);
                ref.invalidate(locationsProvider);
                _showSnack(
                  'Offline Data Downloaded!',
                  AppColors.success,
                  Icons.check_circle_rounded,
                );
              })
              .catchError((e) {
                if (!context.mounted) return;
                Navigator.pop(context);
                _showSnack(
                  'Download failed: $e',
                  AppColors.error,
                  Icons.error_rounded,
                );
              });

          return AlertDialog(
            backgroundColor: AppColors.card,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: const Text(
              'Downloading Data',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                LinearProgressIndicator(
                  value: progress,
                  backgroundColor: AppColors.border,
                  color: AppColors.gold,
                  borderRadius: BorderRadius.circular(8),
                  minHeight: 6,
                ),
                const SizedBox(height: 12),
                Text(
                  status,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
