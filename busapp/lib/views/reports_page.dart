import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../viewmodels/providers.dart';

class ReportsPage extends ConsumerWidget {
  const ReportsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);

    return DarkScreenScaffold(
      appBar: AppBar(
        title: const Text(
          'Analytics & Reports',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(dashboardStatsProvider.future),
        color: AppColors.gold,
        child: statsAsync.when(
          data: (stats) => SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(
                  title: 'Overview',
                  subtitle: 'Performance metrics for your fleet',
                ),
                const SizedBox(height: 24),

                // Stats Grid
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.95,
                  children: [
                    StatCard(
                      icon: Icons.currency_rupee_rounded,
                      label: 'Total Revenue',
                      value:
                          '₹${((stats['totalRevenue'] ?? 0) as num).toLocaleString()}',
                      accentColor: AppColors.success,
                    ),
                    StatCard(
                      icon: Icons.confirmation_num_rounded,
                      label: 'Bookings',
                      value: '${stats['totalBookings'] ?? 0}',
                      accentColor: AppColors.indigo,
                    ),
                    StatCard(
                      icon: Icons.people_rounded,
                      label: 'Total Tickets',
                      value: '${stats['totalTickets'] ?? 0}',
                      accentColor: Colors.purple,
                    ),
                    StatCard(
                      icon: Icons.directions_bus_rounded,
                      label: 'Total Buses',
                      value: '${stats['totalBuses'] ?? 0}',
                      accentColor: AppColors.gold,
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // Recent Performance (Placeholder for Chart)
                const SectionHeader(
                  title: 'Revenue Trend',
                  subtitle: 'Weekly collection overview',
                ),
                const SizedBox(height: 16),
                _buildRevenuePlaceholder(),

                const SizedBox(height: 32),

                // Status Card
                ThemedCard(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.info.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.info_outline_rounded,
                          color: AppColors.info,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Text(
                          'Reports are updated in real-time as tickets are issued.',
                          style: TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
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
    );
  }

  Widget _buildRevenuePlaceholder() {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.bar_chart_rounded,
              color: AppColors.textSecondary.withOpacity(0.3),
              size: 48,
            ),
            const SizedBox(height: 8),
            Text(
              'Chart data available in web dashboard',
              style: TextStyle(
                color: AppColors.textSecondary.withOpacity(0.5),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

extension on num {
  String toLocaleString() {
    return toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }
}
