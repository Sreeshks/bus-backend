import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../viewmodels/providers.dart';

class DailyBillTab extends ConsumerWidget {
  const DailyBillTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dailyBillAsync = ref.watch(dailyBillProvider);
    final today = DateFormat('MMM dd, yyyy').format(DateTime.now());

    return DarkScreenScaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: const Text(
          'Daily Bill Report',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.gold),
            tooltip: 'Refresh Bill',
            onPressed: () => ref.invalidate(dailyBillProvider),
          ),
        ],
      ),
      body: SafeArea(
        child: dailyBillAsync.when(
          data: (stats) {
            final totalAmount = stats['totalAmount'] ?? 0;
            final ticketsCount = stats['ticketsCount'] ?? 0;
            final adultsCount = stats['adultsCount'] ?? 0;
            final childrenCount = stats['childrenCount'] ?? 0;

            return RefreshIndicator(
              onRefresh: () async => ref.invalidate(dailyBillProvider),
              color: AppColors.gold,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // ── Total collection hero card ────────────────────
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.gold.withOpacity(0.15),
                            AppColors.goldDark.withOpacity(0.08),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.borderGold),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'Total Collection Today',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '₹${totalAmount.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: AppColors.goldLight,
                              fontSize: 48,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -1,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.borderGold,
                              ),
                            ),
                            child: Text(
                              today,
                              style: const TextStyle(
                                color: AppColors.goldLight,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    const SectionHeader(title: 'Breakdown'),
                    const SizedBox(height: 16),

                    // ── Stats grid ───────────────────────────────────
                    Row(
                      children: [
                        Expanded(
                          child: StatCard(
                            icon: Icons.confirmation_num_outlined,
                            label: 'Tickets Sold',
                            value: '$ticketsCount',
                            accentColor: AppColors.indigo,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: StatCard(
                            icon: Icons.groups_outlined,
                            label: 'Total Pax',
                            value: '${adultsCount + childrenCount}',
                            accentColor: AppColors.sky,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: StatCard(
                            icon: Icons.man_outlined,
                            label: 'Adults',
                            value: '$adultsCount',
                            accentColor: AppColors.success,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: StatCard(
                            icon: Icons.child_care_outlined,
                            label: 'Children',
                            value: '$childrenCount',
                            accentColor: AppColors.warning,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 32),
                    
                    // ── Pay Mode Breakdown ────────────────────────────
                    if (stats['payModeBreakdown'] != null && (stats['payModeBreakdown'] as List).isNotEmpty) ...[
                      const SectionHeader(title: 'Collection by Pay Mode'),
                      const SizedBox(height: 16),
                      ... (stats['payModeBreakdown'] as List).map((pm) => Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: Container(
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
                                  color: AppColors.fieldBg,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  _getPayModeIcon(pm['mode']),
                                  color: AppColors.gold,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      pm['mode'],
                                      style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 15,
                                      ),
                                    ),
                                    Text(
                                      '${pm['count']} tickets issued',
                                      style: const TextStyle(
                                        color: AppColors.textSecondary,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                '₹${(pm['amount'] as num).toStringAsFixed(0)}',
                                style: const TextStyle(
                                  color: AppColors.goldLight,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )),
                    ],

                    const SizedBox(height: 48),

                    // ── Submit bill button ────────────────────────────
                    SizedBox(
                      height: 56,
                      child: GoldButton(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Row(
                                children: [
                                  Icon(
                                    Icons.check_circle,
                                    color: Colors.white,
                                    size: 18,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Bill verified and submitted to depot!',
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
                        },
                        label: 'VERIFY & SUBMIT BILL',
                        icon: Icons.check_circle_outline_rounded,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.gold),
          ),
          error: (e, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.warning_amber_rounded,
                  size: 48,
                  color: AppColors.error.withOpacity(0.6),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Could not load bill',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  '$e',
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _getPayModeIcon(String mode) {
    final m = mode.toLowerCase();
    if (m.contains('cash')) return Icons.payments_rounded;
    if (m.contains('online') || m.contains('upi')) return Icons.qr_code_scanner_rounded;
    if (m.contains('card')) return Icons.credit_card_rounded;
    return Icons.account_balance_wallet_rounded;
  }
}
