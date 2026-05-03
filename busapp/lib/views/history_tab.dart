import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../viewmodels/providers.dart';

class HistoryTab extends ConsumerWidget {
  const HistoryTab({super.key});

  void _syncTickets(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(ticketRepositoryProvider).syncPendingTickets();
      ref.invalidate(ticketsProvider);
      if (context.mounted) _showSnack(context, 'Sync Complete!', AppColors.success, Icons.check_circle_rounded);
    } catch (e) {
      if (context.mounted) _showSnack(context, 'Sync Error: $e', AppColors.error, Icons.error_rounded);
    }
  }

  void _showSnack(BuildContext context, String msg, Color color, IconData icon) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 8),
          Expanded(child: Text(msg, style: const TextStyle(color: Colors.white, fontSize: 13))),
        ]),
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
    final ticketsAsync = ref.watch(ticketsProvider);

    return DarkScreenScaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        titleSpacing: 16,
        title: const Text(
          'Recent Tickets',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 17,
          ),
        ),
        actions: [
          ticketsAsync.when(
            data: (tickets) {
              final pendingCount = tickets.where((t) => t.ticketNumber.startsWith('OFF')).length;
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.cloud_upload_rounded, color: AppColors.gold, size: 22),
                    tooltip: 'Sync Offline Tickets',
                    onPressed: () => _syncTickets(context, ref),
                  ),
                  if (pendingCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        width: 16,
                        height: 16,
                        decoration: const BoxDecoration(
                          color: AppColors.warning,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            '$pendingCount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              );
            },
            loading: () => IconButton(
              icon: const Icon(Icons.cloud_upload_rounded, color: AppColors.gold, size: 22),
              onPressed: null,
            ),
            error: (_, __) => IconButton(
              icon: const Icon(Icons.cloud_upload_rounded, color: AppColors.gold, size: 22),
              onPressed: () => _syncTickets(context, ref),
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(ticketsProvider),
          color: AppColors.gold,
          child: ticketsAsync.when(
            data: (tickets) {
              if (tickets.isEmpty) return _buildEmptyState();

              final pendingCount = tickets.where((t) => t.ticketNumber.startsWith('OFF')).length;

              return CustomScrollView(
                slivers: [
                  // Summary strip
                  if (tickets.isNotEmpty)
                    SliverToBoxAdapter(
                      child: _buildSummaryStrip(tickets, pendingCount),
                    ),

                  // Pending sync header
                  if (pendingCount > 0)
                    SliverToBoxAdapter(
                      child: _buildGroupLabel('PENDING SYNC', AppColors.warning, Icons.cloud_off_rounded),
                    ),
                  if (pendingCount > 0)
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) {
                          final pending = tickets.where((t) => t.ticketNumber.startsWith('OFF')).toList();
                          return Padding(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                            child: _buildTicketCard(pending[i], isOffline: true),
                          );
                        },
                        childCount: pendingCount,
                      ),
                    ),

                  // Synced header
                  SliverToBoxAdapter(
                    child: _buildGroupLabel('ISSUED TODAY', AppColors.textSecondary, Icons.receipt_long_rounded),
                  ),
                  SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (ctx, i) {
                        final synced = tickets.where((t) => !t.ticketNumber.startsWith('OFF')).toList();
                        return Padding(
                          padding: EdgeInsets.fromLTRB(16, 0, 16, i == synced.length - 1 ? 24 : 10),
                          child: _buildTicketCard(synced[i], isOffline: false),
                        );
                      },
                      childCount: tickets.where((t) => !t.ticketNumber.startsWith('OFF')).length,
                    ),
                  ),
                ],
              );
            },
            loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2),
            ),
            error: (e, _) => _buildErrorState(e),
          ),
        ),
      ),
    );
  }

  // ── Summary strip ──────────────────────────────────────────────────────────

  Widget _buildSummaryStrip(List tickets, int pendingCount) {
    final total = tickets.fold<double>(0, (sum, t) => sum + (t.totalAmount as double));
    final syncedCount = tickets.length - pendingCount;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
        children: [
          _summaryItem('Total', '₹${total.toStringAsFixed(0)}', AppColors.goldLight),
          _summaryDivider(),
          _summaryItem('Tickets', '${tickets.length}', AppColors.textPrimary),
          _summaryDivider(),
          _summaryItem('Synced', '$syncedCount', AppColors.success),
          if (pendingCount > 0) ...[
            _summaryDivider(),
            _summaryItem('Pending', '$pendingCount', AppColors.warning),
          ],
        ],
      ),
    );
  }

  Widget _summaryItem(String label, String value, Color valueColor) {
    return Expanded(
      child: Column(
        children: [
          Text(value,
              style: TextStyle(
                  fontSize: 16, fontWeight: FontWeight.w900, color: valueColor)),
          const SizedBox(height: 2),
          Text(label,
              style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.3)),
        ],
      ),
    );
  }

  Widget _summaryDivider() => Container(
        width: 1, height: 30, color: AppColors.borderGold.withValues(alpha: 0.4));

  // ── Group label ────────────────────────────────────────────────────────────

  Widget _buildGroupLabel(String label, Color color, IconData icon) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Row(
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 5),
          Text(label,
              style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: color,
                  letterSpacing: 1.2)),
        ],
      ),
    );
  }

  // ── Ticket card ────────────────────────────────────────────────────────────

  Widget _buildTicketCard(dynamic t, {required bool isOffline}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isOffline
              ? AppColors.warning.withValues(alpha: 0.25)
              : AppColors.border,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            // Icon badge
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isOffline
                    ? AppColors.warning.withValues(alpha: 0.10)
                    : AppColors.fieldBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isOffline
                      ? AppColors.warning.withValues(alpha: 0.25)
                      : AppColors.border,
                ),
              ),
              child: Icon(
                isOffline ? Icons.cloud_off_rounded : Icons.receipt_long_rounded,
                color: isOffline ? AppColors.warning : AppColors.textSecondary,
                size: 18,
              ),
            ),
            const SizedBox(width: 12),

            // Route info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    t.ticketNumber,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: AppColors.textPrimary,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          t.source,
                          style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                              fontWeight: FontWeight.w500),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 5),
                        child: Icon(Icons.arrow_right_alt_rounded,
                            size: 14, color: AppColors.textMuted),
                      ),
                      Flexible(
                        child: Text(
                          t.destination,
                          style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                              fontWeight: FontWeight.w500),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),

            // Amount + badge
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₹${t.totalAmount.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 20,
                    color: AppColors.success,
                    letterSpacing: -0.5,
                  ),
                ),
                if (isOffline)
                  const SizedBox(height: 4),
                if (isOffline)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                          color: AppColors.warning.withValues(alpha: 0.3)),
                    ),
                    child: const Text(
                      'Pending',
                      style: TextStyle(
                          fontSize: 9,
                          color: AppColors.warning,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.3),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.card,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.border),
            ),
            child: Icon(
              Icons.receipt_long_outlined,
              size: 36,
              color: AppColors.textSecondary.withValues(alpha: 0.4),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'No tickets yet',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Tickets you issue will appear here',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
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
              color: AppColors.error.withValues(alpha: 0.08),
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.error.withValues(alpha: 0.2)),
            ),
            child: const Icon(Icons.error_outline_rounded,
                size: 28, color: AppColors.error),
          ),
          const SizedBox(height: 16),
          const Text('Failed to load tickets',
              style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 6),
          Text(
            '$e',
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
          ),
        ],
      ),
    );
  }
}