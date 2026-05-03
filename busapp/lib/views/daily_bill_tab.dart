import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../viewmodels/providers.dart';

class DailyBillTab extends ConsumerWidget {
  const DailyBillTab({super.key});

  void _showSnack(
    BuildContext context,
    String msg,
    Color color,
    IconData icon,
  ) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 16),
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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dailyBillAsync = ref.watch(dailyBillProvider);
    final today = DateFormat('EEE, MMM d').format(DateTime.now());

    return DarkScreenScaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        titleSpacing: 16,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Daily Bill',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 17,
                height: 1.1,
              ),
            ),
            Text(
              today,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
                height: 1.1,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.refresh_rounded,
              color: AppColors.gold,
              size: 22,
            ),
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(dailyBillProvider),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(
        child: dailyBillAsync.when(
          data: (stats) {
            final totalAmount = (stats['totalAmount'] ?? 0) as num;
            final ticketsCount = (stats['ticketsCount'] ?? 0) as num;
            final adultsCount = (stats['adultsCount'] ?? 0) as num;
            final childrenCount = (stats['childrenCount'] ?? 0) as num;
            final payModes = stats['payModeBreakdown'] as List? ?? [];

            return RefreshIndicator(
              onRefresh: () async => ref.invalidate(dailyBillProvider),
              color: AppColors.gold,
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // ── Hero collection card ──────────────────────────
                    _buildHeroCard(totalAmount),

                    const SizedBox(height: 20),

                    // ── Stats grid ────────────────────────────────────
                    _buildSectionLabel('BREAKDOWN', Icons.bar_chart_rounded),
                    const SizedBox(height: 10),
                    _buildStatsGrid(ticketsCount, adultsCount, childrenCount),

                    // ── Pay mode breakdown ────────────────────────────
                    if (payModes.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      _buildSectionLabel(
                        'BY PAYMENT MODE',
                        Icons.payment_rounded,
                      ),
                      const SizedBox(height: 10),
                      ...payModes.map(
                        (pm) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: _buildPayModeRow(pm, totalAmount),
                        ),
                      ),
                    ],

                    const SizedBox(height: 24),

                    // ── Submit button ─────────────────────────────────
                    SizedBox(
                      height: 54,
                      child: GoldButton(
                        onTap: () => _showSnack(
                          context,
                          'Bill verified and submitted to depot!',
                          AppColors.success,
                          Icons.check_circle_rounded,
                        ),
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
            child: CircularProgressIndicator(
              color: AppColors.gold,
              strokeWidth: 2,
            ),
          ),
          error: (e, _) => _buildErrorState(e),
        ),
      ),
    );
  }

  // ── Hero card ──────────────────────────────────────────────────────────────

  Widget _buildHeroCard(num totalAmount) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.gold.withValues(alpha: 0.13),
            AppColors.goldDark.withValues(alpha: 0.07),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.borderGold),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.account_balance_wallet_rounded,
                color: AppColors.goldLight,
                size: 14,
              ),
              const SizedBox(width: 5),
              const Text(
                'TOTAL COLLECTION',
                style: TextStyle(
                  color: AppColors.goldLight,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '₹${totalAmount.toStringAsFixed(2)}',
            style: const TextStyle(
              color: AppColors.goldLight,
              fontSize: 44,
              fontWeight: FontWeight.w900,
              letterSpacing: -1.5,
              height: 1.0,
            ),
          ),
        ],
      ),
    );
  }

  // ── Section label ──────────────────────────────────────────────────────────

  Widget _buildSectionLabel(String label, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 11, color: AppColors.gold),
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

  // ── Stats grid ─────────────────────────────────────────────────────────────

  Widget _buildStatsGrid(num tickets, num adults, num children) {
    return Row(
      children: [
        Expanded(
          child: _buildStatTile(
            icon: Icons.confirmation_num_rounded,
            label: 'Tickets',
            value: '$tickets',
            color: AppColors.indigo,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatTile(
            icon: Icons.groups_rounded,
            label: 'Total Pax',
            value: '${adults + children}',
            color: AppColors.sky,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatTile(
            icon: Icons.man_rounded,
            label: 'Adults',
            value: '$adults',
            color: AppColors.success,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _buildStatTile(
            icon: Icons.child_care_rounded,
            label: 'Children',
            value: '$children',
            color: AppColors.warning,
          ),
        ),
      ],
    );
  }

  Widget _buildStatTile({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, color: color, size: 16),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: color,
              height: 1.0,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  // ── Pay mode row ───────────────────────────────────────────────────────────

  Widget _buildPayModeRow(dynamic pm, num totalAmount) {
    final amount = (pm['amount'] as num).toDouble();
    final pct = totalAmount > 0 ? (amount / totalAmount.toDouble()) : 0.0;
    final color = _getPayModeColor(pm['mode'] as String);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Icon
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  _getPayModeIcon(pm['mode'] as String),
                  color: color,
                  size: 17,
                ),
              ),
              const SizedBox(width: 12),
              // Label
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      pm['mode'] as String,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      '${pm['count']} ticket${(pm['count'] as num) != 1 ? 's' : ''}',
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              // Amount
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹${amount.toStringAsFixed(0)}',
                    style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.w900,
                      fontSize: 17,
                      letterSpacing: -0.5,
                    ),
                  ),
                  Text(
                    '${(pct * 100).toStringAsFixed(0)}%',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct.clamp(0.0, 1.0),
              minHeight: 4,
              backgroundColor: AppColors.border,
              valueColor: AlwaysStoppedAnimation<Color>(
                color.withValues(alpha: 0.7),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────

  Widget _buildErrorState(Object e) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.warning.withValues(alpha: 0.08),
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.warning.withValues(alpha: 0.2),
              ),
            ),
            child: const Icon(
              Icons.warning_amber_rounded,
              size: 28,
              color: AppColors.warning,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Could not load bill',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '$e',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  IconData _getPayModeIcon(String mode) {
    final m = mode.toLowerCase();
    if (m.contains('cash')) return Icons.payments_rounded;
    if (m.contains('online') || m.contains('upi'))
      return Icons.qr_code_scanner_rounded;
    if (m.contains('card')) return Icons.credit_card_rounded;
    return Icons.account_balance_wallet_rounded;
  }

  Color _getPayModeColor(String mode) {
    final m = mode.toLowerCase();
    if (m.contains('cash')) return AppColors.gold;
    if (m.contains('online') || m.contains('upi')) return AppColors.indigo;
    if (m.contains('card')) return AppColors.sky;
    return AppColors.success;
  }
}
