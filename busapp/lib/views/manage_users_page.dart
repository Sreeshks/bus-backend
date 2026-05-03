import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_colors.dart';
import '../core/widgets/shared_widgets.dart';
import '../data/models/user_model.dart';
import '../viewmodels/providers.dart';

class ManageUsersPage extends ConsumerWidget {
  const ManageUsersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(usersProvider);

    return DarkScreenScaffold(
      appBar: AppBar(
        title: const Text('Manage Staff', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: AppColors.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(usersProvider.future),
        color: AppColors.gold,
        child: usersAsync.when(
          data: (users) => ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: users.length,
            itemBuilder: (context, index) {
              final user = users[index];
              return _buildUserCard(context, ref, user);
            },
          ),
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
          error: (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: AppColors.error))),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showUserDialog(context, ref),
        backgroundColor: AppColors.gold,
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  Widget _buildUserCard(BuildContext context, WidgetRef ref, User user) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: _getRoleColor(user.role).withOpacity(0.12),
                child: Icon(Icons.person, color: _getRoleColor(user.role), size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.name,
                      style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    Text(
                      user.email,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getRoleColor(user.role).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      user.role.toUpperCase(),
                      style: TextStyle(color: _getRoleColor(user.role), fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  IconButton(
                    onPressed: () => _showUserDialog(context, ref, user: user),
                    icon: const Icon(Icons.edit_note_rounded, color: AppColors.gold, size: 22),
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ),
            ],
          ),
          if (user.assignedBus != null) ...[
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Divider(color: AppColors.border, height: 1),
            ),
            Row(
              children: [
                const Icon(Icons.directions_bus_rounded, color: AppColors.gold, size: 14),
                const SizedBox(width: 8),
                Text(
                  'Assigned: ${user.assignedBus!.name} (${user.assignedBus!.busNumber})',
                  style: const TextStyle(color: AppColors.goldLight, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role.toLowerCase()) {
      case 'admin': return AppColors.error;
      case 'conductor': return AppColors.gold;
      case 'manager': return AppColors.info;
      default: return AppColors.textSecondary;
    }
  }

  void _showUserDialog(BuildContext context, WidgetRef ref, {User? user}) {
    final isEdit = user != null;
    final nameCtrl = TextEditingController(text: user?.name);
    final emailCtrl = TextEditingController(text: user?.email);
    final passCtrl = TextEditingController();
    String selectedRole = user?.role ?? 'Conductor';
    String? selectedBusId = user?.assignedBus?.id;

    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          final busesAsync = ref.watch(busesProvider);
          return Container(
            padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(isEdit ? 'Edit Staff' : 'Add New Staff',
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 24),
                  DarkTextField(controller: nameCtrl, hint: 'Full Name', prefixIcon: Icons.person_outline_rounded),
                  const SizedBox(height: 16),
                  DarkTextField(
                      controller: emailCtrl,
                      hint: 'Email Address',
                      keyboardType: TextInputType.emailAddress,
                      prefixIcon: Icons.alternate_email_rounded),
                  const SizedBox(height: 16),
                  DarkTextField(
                    controller: passCtrl,
                    hint: isEdit ? 'New Password (leave blank to keep)' : 'Password',
                    obscureText: true,
                    prefixIcon: Icons.lock_outline_rounded,
                  ),
                  const SizedBox(height: 20),
                  const Text('Assigned Role',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    children: ['Admin', 'Manager', 'Conductor'].map((role) {
                      final isSelected = selectedRole == role;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setModalState(() => selectedRole = role),
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.gold.withOpacity(0.12) : AppColors.fieldBg,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: isSelected ? AppColors.gold : AppColors.border),
                            ),
                            child: Text(
                              role,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                  color: isSelected ? AppColors.gold : AppColors.textSecondary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  if (selectedRole != 'Admin') ...[
                    const SizedBox(height: 20),
                    const Text('Assign Bus',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    busesAsync.when(
                      data: (buses) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                            color: AppColors.fieldBg,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.border)),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: selectedBusId,
                            hint: const Text('Select Bus', style: TextStyle(color: AppColors.textSecondary)),
                            dropdownColor: AppColors.surface,
                            isExpanded: true,
                            items: [
                              const DropdownMenuItem<String>(
                                  value: null,
                                  child: Text('None / Unassigned', style: TextStyle(color: AppColors.textMuted))),
                              ...buses.map((b) => DropdownMenuItem(
                                  value: b.id,
                                  child: Text('${b.name} (${b.busNumber})',
                                      style: const TextStyle(color: AppColors.textPrimary)))),
                            ],
                            onChanged: (val) => setModalState(() => selectedBusId = val),
                          ),
                        ),
                      ),
                      loading: () => const LinearProgressIndicator(color: AppColors.gold),
                      error: (e, _) => const Text('Error loading buses', style: TextStyle(color: AppColors.error)),
                    ),
                  ],
                  const SizedBox(height: 32),
                  isLoading
                      ? const LoadingButton()
                      : GoldButton(
                          onTap: () async {
                            if (nameCtrl.text.isEmpty || emailCtrl.text.isEmpty) return;
                            if (!isEdit && passCtrl.text.isEmpty) return;
                            setModalState(() => isLoading = true);
                            try {
                              final data = {
                                'name': nameCtrl.text.trim(),
                                'email': emailCtrl.text.trim(),
                                'role': selectedRole,
                                'assignedBus': selectedBusId,
                              };
                              if (passCtrl.text.isNotEmpty) {
                                data['password'] = passCtrl.text.trim();
                              }

                              if (isEdit) {
                                await ref.read(authRepositoryProvider).updateUser(user!.id, data);
                              } else {
                                await ref.read(authRepositoryProvider).createUser(data);
                              }

                              ref.invalidate(usersProvider);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                                    content: Text(isEdit ? 'Staff Updated!' : 'Staff Registered!'),
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
                          label: isEdit ? 'SAVE CHANGES' : 'CREATE USER',
                          icon: isEdit ? Icons.save_rounded : Icons.person_add_rounded,
                        ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
