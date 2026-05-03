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
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white, size: 18),
                SizedBox(width: 8),
                Text(
                  'Sync Complete!',
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
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Sync Error: $e",
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
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ticketsAsync = ref.watch(ticketsProvider);

    return DarkScreenScaffold(
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        title: const Text(
          'Recent Tickets',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.cloud_upload_rounded,
              color: AppColors.gold,
            ),
            tooltip: 'Sync Offline Tickets',
            onPressed: () => _syncTickets(context, ref),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(ticketsProvider),
          color: AppColors.gold,
          child: ticketsAsync.when(
            data: (tickets) {
              if (tickets.isEmpty) {
                return _buildEmptyState();
              }
              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: tickets.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (ctx, i) {
                  final t = tickets[i];
                  final isOffline = t.ticketNumber.startsWith('OFF');

                  return Container(
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isOffline
                            ? AppColors.warning.withOpacity(0.3)
                            : AppColors.border,
                        width: 1,
                      ),
                    ),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                      leading: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isOffline
                              ? AppColors.warning.withOpacity(0.1)
                              : AppColors.fieldBg,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isOffline
                                ? AppColors.warning.withOpacity(0.2)
                                : AppColors.border,
                          ),
                        ),
                        child: Icon(
                          isOffline
                              ? Icons.cloud_off_rounded
                              : Icons.receipt_long_rounded,
                          color: isOffline
                              ? AppColors.warning
                              : AppColors.textSecondary,
                        ),
                      ),
                      title: Text(
                        t.ticketNumber,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: 6.0),
                        child: Row(
                          children: [
                            Text(
                              t.source,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 6),
                              child: Icon(
                                Icons.arrow_right_alt_rounded,
                                size: 16,
                                color: AppColors.textMuted,
                              ),
                            ),
                            Text(
                              t.destination,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '₹${t.totalAmount.toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 20,
                              color: AppColors.success,
                            ),
                          ),
                          if (isOffline)
                            Padding(
                              padding: const EdgeInsets.only(top: 4.0),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.warning.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(
                                    color: AppColors.warning.withOpacity(0.3),
                                  ),
                                ),
                                child: const Text(
                                  'Pending Sync',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: AppColors.warning,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
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
            error: (e, _) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline_rounded,
                    size: 48,
                    color: AppColors.error.withOpacity(0.6),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Failed to load tickets\n$e',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.card,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.border),
            ),
            child: Icon(
              Icons.receipt_long_outlined,
              size: 64,
              color: AppColors.textSecondary.withOpacity(0.4),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'No tickets issued yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Tickets you issue today will appear here',
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
