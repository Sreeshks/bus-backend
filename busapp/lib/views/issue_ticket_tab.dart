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

class _IssueTicketTabState extends ConsumerState<IssueTicketTab> {
  String? selectedSource;
  String? selectedDestination;
  int adultCount = 1;
  int childCount = 0;
  bool issuing = false;
  double? estimatedFare;
  bool loadingFare = false;
  String selectedPayMode = 'Cash';

  // ── fare logic ──────────────────────────────────────────────────────────────

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

  void _onSelectionChanged() => _checkFare();

  void _issueTicket() async {
    final user = ref.read(authProvider).user;
    if (user == null || !user.hasBusAssigned || estimatedFare == null) return;

    setState(() => issuing = true);
    try {
      await ref
          .read(ticketRepositoryProvider)
          .issueTicket(
            busId: user.assignedBusId!,
            source: selectedSource!,
            destination: selectedDestination!,
            adultCount: adultCount,
            childCount: childCount,
            totalAmount: estimatedFare!,
            payMode: selectedPayMode,
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 8),
                Text(
                  'Ticket Printed Successfully!',
                  style: TextStyle(color: Colors.white),
                ),
              ],
            ),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
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
      _checkFare();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              e.toString(),
              style: const TextStyle(color: Colors.white),
            ),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
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

  // ── build ───────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final locationsAsync = ref.watch(locationsProvider);

    return DarkScreenScaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ente Yatra Terminal',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              user?.name ?? 'Staff',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.cloud_download_outlined,
              color: AppColors.gold,
            ),
            tooltip: 'Download Offline Data',
            onPressed: _downloadData,
          ),
          IconButton(
            icon: const Icon(
              Icons.logout_rounded,
              color: AppColors.textSecondary,
            ),
            tooltip: 'Logout',
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(locationsProvider);
          },
          color: AppColors.gold,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Assigned Bus Info Card ────────────────────────────
                _buildAssignedBusCard(user),

                const SizedBox(height: 32),

                // ── Route selection ─────────────────────────────────
                ThemedCard(
                  child: locationsAsync.when(
                    data: (locs) => Column(
                      children: [
                        _buildDarkDropdown(
                          value: selectedSource,
                          label: 'From Location',
                          icon: Icons.trip_origin_rounded,
                          iconColor: AppColors.info,
                          items: locs,
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
                              Container(
                                width: 40,
                                height: 1,
                                color: AppColors.border,
                              ),
                              Container(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.fieldBg,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: IconButton(
                                  icon: const Icon(
                                    Icons.swap_vert_rounded,
                                    color: AppColors.textSecondary,
                                  ),
                                  onPressed: _swapLocations,
                                ),
                              ),
                              Container(
                                width: 40,
                                height: 1,
                                color: AppColors.border,
                              ),
                            ],
                          ),
                        ),

                        _buildDarkDropdown(
                          value: selectedDestination,
                          label: 'To Location',
                          icon: Icons.location_on_rounded,
                          iconColor: AppColors.error,
                          items: locs,
                          onChanged: (v) {
                            setState(() => selectedDestination = v);
                            _onSelectionChanged();
                          },
                        ),
                      ],
                    ),
                    loading: () => const Center(
                      child: CircularProgressIndicator(color: AppColors.gold),
                    ),
                    error: (e, _) => const Center(
                      child: Text(
                        'Error loading locations',
                        style: TextStyle(color: AppColors.error),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // ── Passengers ──────────────────────────────────────
                ThemedCard(
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
                        color: AppColors.border,
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

                const SizedBox(height: 24),

                // ── Payment Modes ───────────────────────────────────
                const SectionHeader(title: 'PAYMENT METHOD'),
                const SizedBox(height: 16),
                ref
                    .watch(payModesProvider)
                    .when(
                      data: (modes) {
                        // If no modes from API, show default Cash
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

                        return GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 2.2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                          itemCount: displayModes.length,
                          itemBuilder: (context, index) {
                            final mode = displayModes[index];
                            final isSelected = selectedPayMode == mode.name;

                            return InkWell(
                              onTap: () =>
                                  setState(() => selectedPayMode = mode.name),
                              borderRadius: BorderRadius.circular(16),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? _parseColor(
                                          mode.color,
                                        ).withValues(alpha: 0.15)
                                      : AppColors.card,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isSelected
                                        ? _parseColor(mode.color)
                                        : AppColors.border,
                                    width: isSelected ? 2 : 1,
                                  ),
                                  boxShadow: isSelected
                                      ? [
                                          BoxShadow(
                                            color: _parseColor(
                                              mode.color,
                                            ).withValues(alpha: 0.2),
                                            blurRadius: 8,
                                            offset: const Offset(0, 4),
                                          ),
                                        ]
                                      : null,
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      _getIconData(mode.icon),
                                      color: isSelected
                                          ? _parseColor(mode.color)
                                          : AppColors.textSecondary,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      mode.name.toUpperCase(),
                                      style: TextStyle(
                                        color: isSelected
                                            ? AppColors.textPrimary
                                            : AppColors.textSecondary,
                                        fontWeight: isSelected
                                            ? FontWeight.bold
                                            : FontWeight.w500,
                                        fontSize: 13,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        );
                      },
                      loading: () => const Center(
                        child: CircularProgressIndicator(color: AppColors.gold),
                      ),
                      error: (e, _) => _buildDefaultPayModes(),
                    ),

                const SizedBox(height: 32),

                // ── Estimated fare ──────────────────────────────────
                if (loadingFare)
                  const Center(
                    child: CircularProgressIndicator(color: AppColors.gold),
                  )
                else if (estimatedFare != null && estimatedFare! > 0)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.gold.withValues(alpha: 0.12),
                          AppColors.goldDark.withValues(alpha: 0.08),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderGold),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Total Fare',
                              style: TextStyle(
                                color: AppColors.goldLight,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              'Including all taxes',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '₹${estimatedFare!.toStringAsFixed(0)}',
                          style: const TextStyle(
                            color: AppColors.goldLight,
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -1,
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 32),

                // ── Issue ticket button ─────────────────────────────
                SizedBox(
                  height: 60,
                  child: issuing
                      ? const LoadingButton()
                      : GoldButton(
                          onTap: _issueTicket,
                          label: 'PRINT TICKET',
                          icon: Icons.print_rounded,
                          enabled:
                              estimatedFare != null &&
                              estimatedFare != 0 &&
                              user != null &&
                              user.hasBusAssigned,
                        ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── helper functions ──────────────────────────────────────────────────────

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xff')));
    } catch (e) {
      return AppColors.gold;
    }
  }

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'payments':
        return Icons.payments_rounded;
      case 'credit_card':
        return Icons.credit_card_rounded;
      case 'account_balance_wallet':
        return Icons.account_balance_wallet_rounded;
      case 'qr_code':
        return Icons.qr_code_scanner_rounded;
      case 'smartphone':
        return Icons.smartphone_rounded;
      case 'receipt':
        return Icons.receipt_long_rounded;
      default:
        return Icons.payments_rounded;
    }
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

    return Row(
      children: modes.map((m) {
        final isSelected = selectedPayMode == m['name'];
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: InkWell(
              onTap: () =>
                  setState(() => selectedPayMode = m['name'] as String),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                height: 54,
                decoration: BoxDecoration(
                  color: isSelected
                      ? (m['color'] as Color).withOpacity(0.1)
                      : AppColors.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? (m['color'] as Color)
                        : AppColors.border,
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      m['icon'] as IconData,
                      color: isSelected
                          ? (m['color'] as Color)
                          : AppColors.textSecondary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      (m['name'] as String).toUpperCase(),
                      style: TextStyle(
                        color: isSelected
                            ? AppColors.textPrimary
                            : AppColors.textSecondary,
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.w500,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  // ── helper functions ──────────────────────────────────────────────────────

  // ── helper widgets ────────────────────────────────────────────────────────

  /// Displays the assigned bus as a non-editable info card
  Widget _buildAssignedBusCard(dynamic user) {
    final bool hasAssignment = user != null && user.hasBusAssigned;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: hasAssignment
            ? AppColors.gold.withValues(alpha: 0.08)
            : AppColors.error.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasAssignment
              ? AppColors.borderGold
              : AppColors.error.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: hasAssignment
                  ? AppColors.gold.withValues(alpha: 0.15)
                  : AppColors.error.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              Icons.directions_bus_rounded,
              color: hasAssignment ? AppColors.gold : AppColors.error,
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hasAssignment ? 'Assigned Bus' : 'No Bus Assigned',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: hasAssignment
                        ? AppColors.goldLight
                        : AppColors.error,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  hasAssignment
                      ? user.assignedBusDisplay
                      : 'Contact admin to assign a bus',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: hasAssignment
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          if (hasAssignment)
            const Icon(
              Icons.check_circle_rounded,
              color: AppColors.success,
              size: 22,
            ),
        ],
      ),
    );
  }

  Widget _buildDarkDropdown({
    required String? value,
    required String label,
    required IconData icon,
    required Color iconColor,
    required List items,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      dropdownColor: AppColors.card,
      style: const TextStyle(color: AppColors.textPrimary, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: AppColors.textSecondary),
        prefixIcon: Icon(icon, color: iconColor),
        filled: true,
        fillColor: AppColors.fieldBg,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
        ),
      ),
      items: items
          .map<DropdownMenuItem<String>>(
            (l) => DropdownMenuItem<String>(
              value: l.name as String,
              child: Text(
                l.name as String,
                style: const TextStyle(color: AppColors.textPrimary),
              ),
            ),
          )
          .toList(),
      onChanged: onChanged,
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
            color: AppColors.textSecondary,
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
                  color: AppColors.fieldBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: const Icon(
                  Icons.remove_rounded,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
            Text(
              '$value',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary,
              ),
            ),
            InkWell(
              onTap: () => onChanged(value + 1),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderGold),
                ),
                child: const Icon(Icons.add_rounded, color: AppColors.gold),
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
                if (!context.mounted) return;
                Navigator.pop(context);
                ref.invalidate(locationsProvider);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.white, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'Offline Data Downloaded!',
                          style: TextStyle(color: Colors.white),
                        ),
                      ],
                    ),
                    backgroundColor: AppColors.success,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                );
              })
              .catchError((e) {
                if (!context.mounted) return;
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      "Download failed: $e",
                      style: const TextStyle(color: Colors.white),
                    ),
                    backgroundColor: AppColors.error,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                );
              });

          return AlertDialog(
            backgroundColor: AppColors.card,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: const Text(
              "Downloading Master Data",
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
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
                  minHeight: 8,
                ),
                const SizedBox(height: 16),
                Text(
                  status,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textSecondary,
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
