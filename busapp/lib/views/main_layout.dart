import 'package:busapp/viewmodels/providers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import 'issue_ticket_tab.dart';
import 'history_tab.dart';
import 'daily_bill_tab.dart';
import 'admin_tab.dart';

class MainLayout extends ConsumerStatefulWidget {
  const MainLayout({super.key});

  @override
  ConsumerState<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends ConsumerState<MainLayout> {
  int _currentIndex = 0;

  List<Widget> _getTabs(bool isAdmin) {
    return [
      const IssueTicketTab(),
      const HistoryTab(),
      const DailyBillTab(),
      if (isAdmin) const AdminTab(),
    ];
  }

  List<BottomNavigationBarItem> _getNavItems(bool isAdmin) {
    return [
      const BottomNavigationBarItem(
        icon: Icon(Icons.confirmation_num_outlined),
        activeIcon: Icon(Icons.confirmation_num),
        label: 'Issue Ticket',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.history_outlined),
        activeIcon: Icon(Icons.history),
        label: 'History',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.receipt_long_outlined),
        activeIcon: Icon(Icons.receipt_long),
        label: 'Daily Bill',
      ),
      if (isAdmin)
        const BottomNavigationBarItem(
          icon: Icon(Icons.admin_panel_settings_outlined),
          activeIcon: Icon(Icons.admin_panel_settings),
          label: 'Admin',
        ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final isAdmin = user?.isAdmin ?? false;
    final tabs = _getTabs(isAdmin);

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: tabs[_currentIndex >= tabs.length ? 0 : _currentIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.border, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex >= tabs.length ? 0 : _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.goldLight,
          unselectedItemColor: AppColors.textSecondary,
          showUnselectedLabels: true,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
          unselectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w500,
            fontSize: 12,
          ),
          items: _getNavItems(isAdmin),
        ),
      ),
    );
  }
}
