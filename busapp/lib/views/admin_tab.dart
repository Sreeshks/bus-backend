import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../viewmodels/providers.dart';
import 'manage_users_page.dart';
import 'manage_buses_page.dart';
import 'master_data_page.dart';
import 'reports_page.dart';
import 'manage_trips_page.dart';
import 'manage_bookings_page.dart';

class AdminTab extends ConsumerWidget {
  const AdminTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;

    return DarkScreenScaffold(
      appBar: _buildAppBar(user, ref),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Management grid ────────────────────────────────────
              _buildSectionLabel('MANAGEMENT', Icons.dashboard_rounded),
              const SizedBox(height: 10),
              _buildManagementGrid(context),

              const SizedBox(height: 20),

              // ── Quick stats ────────────────────────────────────────
              _buildSectionLabel('SYSTEM', Icons.monitor_heart_rounded),
              const SizedBox(height: 10),
              _buildSystemStatus(),

              const SizedBox(height: 20),

              // ── Quick actions ──────────────────────────────────────
              _buildSectionLabel('QUICK ACTIONS', Icons.bolt_rounded),
              const SizedBox(height: 10),
              _buildQuickActions(context, ref),

              const SizedBox(height: 24),

              // ── Logout ─────────────────────────────────────────────
              SizedBox(
                height: 54,
                child: GoldButton(
                  onTap: () => ref.read(authProvider.notifier).logout(),
                  label: 'LOGOUT FROM PANEL',
                  icon: Icons.logout_rounded,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── AppBar ─────────────────────────────────────────────────────────────────

  PreferredSizeWidget _buildAppBar(dynamic user, WidgetRef ref) {
    final initial = (user?.name ?? 'A').substring(0, 1).toUpperCase();

    return AppBar(
      backgroundColor: AppColors.surface,
      titleSpacing: 16,
      title: Row(
        children: [
          // Avatar
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.goldLight, AppColors.goldDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                initial,
                style: const TextStyle(
                  color: Colors.black87,
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  user?.name ?? 'Admin',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 1),
                const Row(
                  children: [
                    Icon(Icons.shield_rounded, size: 10, color: AppColors.gold),
                    SizedBox(width: 3),
                    Text(
                      'Administrator',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.goldLight,
                        fontWeight: FontWeight.w500,
                        height: 1.1,
                      ),
                    ),
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

  // ── Management grid ────────────────────────────────────────────────────────

  Widget _buildManagementGrid(BuildContext context) {
    final cards = [
      _CardData(
        title: 'Users',
        subtitle: 'Conductors & staff',
        icon: Icons.people_rounded,
        color: AppColors.info,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ManageUsersPage()),
        ),
      ),
      _CardData(
        title: 'Buses',
        subtitle: 'Fleet management',
        icon: Icons.directions_bus_rounded,
        color: AppColors.gold,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ManageBusesPage()),
        ),
      ),
      _CardData(
        title: 'Trips',
        subtitle: 'Schedule & timing',
        icon: Icons.calendar_today_rounded,
        color: AppColors.indigo,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ManageTripsPage()),
        ),
      ),
      _CardData(
        title: 'Master Data',
        subtitle: 'Routes, Fares, etc.',
        icon: Icons.miscellaneous_services_rounded,
        color: AppColors.success,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MasterDataPage()),
        ),
      ),
      _CardData(
        title: 'Bookings',
        subtitle: 'All issued tickets',
        icon: Icons.confirmation_num_rounded,
        color: AppColors.error,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ManageBookingsPage()),
        ),
      ),
      _CardData(
        title: 'Reports',
        subtitle: 'Analytics & bills',
        icon: Icons.analytics_rounded,
        color: const Color(0xFF9C6FD6),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ReportsPage()),
        ),
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 0.95,
      ),
      itemCount: cards.length,
      itemBuilder: (context, i) => _AdminCard(data: cards[i]),
    );
  }

  // ── System status ──────────────────────────────────────────────────────────

  Widget _buildSystemStatus() {
    final items = [
      _StatusItem('API', 'Online', AppColors.success, Icons.cloud_done_rounded),
      _StatusItem('Sync', 'Active', AppColors.info, Icons.sync_rounded),
      _StatusItem('DB', 'Healthy', AppColors.success, Icons.storage_rounded),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: items.map((item) {
          final isLast = item == items.last;
          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: item.color.withValues(alpha: 0.10),
                          borderRadius: BorderRadius.circular(9),
                        ),
                        child: Icon(item.icon, color: item.color, size: 16),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        item.label,
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 5,
                            height: 5,
                            decoration: BoxDecoration(
                              color: item.color,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 3),
                          Text(
                            item.status,
                            style: TextStyle(
                              color: item.color,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (!isLast)
                  Container(
                    width: 1,
                    height: 40,
                    color: AppColors.border,
                    margin: const EdgeInsets.symmetric(horizontal: 6),
                  ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Quick actions ──────────────────────────────────────────────────────────

  Widget _buildQuickActions(BuildContext context, WidgetRef ref) {
    final actions = [
      _QuickAction(
        label: 'Add Conductor',
        icon: Icons.person_add_rounded,
        color: AppColors.info,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ManageUsersPage()),
        ),
      ),
      _QuickAction(
        label: 'Add Bus',
        icon: Icons.add_box_rounded,
        color: AppColors.gold,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ManageBusesPage()),
        ),
      ),
      _QuickAction(
        label: 'Update Fares',
        icon: Icons.price_change_rounded,
        color: AppColors.success,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MasterDataPage()),
        ),
      ),
    ];

    return Column(
      children: actions.map((a) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: InkWell(
            onTap: a.onTap,
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: a.color.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(a.icon, color: a.color, size: 17),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      a.label,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: AppColors.textSecondary,
                    size: 13,
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ── Data classes ──────────────────────────────────────────────────────────────

class _CardData {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _CardData({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });
}

class _StatusItem {
  final String label;
  final String status;
  final Color color;
  final IconData icon;
  const _StatusItem(this.label, this.status, this.color, this.icon);
}

class _QuickAction {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _QuickAction({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });
}

// ── Admin card widget ─────────────────────────────────────────────────────────

class _AdminCard extends StatelessWidget {
  final _CardData data;
  const _AdminCard({required this.data});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: data.onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: data.color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(data.icon, color: data.color, size: 18),
            ),
            const Spacer(),
            Text(
              data.title,
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
                fontSize: 13,
                height: 1.1,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              data.subtitle,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 10,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
