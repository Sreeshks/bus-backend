import 'package:flutter/material.dart';

/// Centralized color palette for the Ente Yatra dark-gold theme.
/// All screens must reference these constants instead of inline colors.
class AppColors {
  AppColors._();

  // ── backgrounds ───────────────────────────────────────────────
  static const bg = Color(0xFF090E1C);
  static const surface = Color(0xFF111827);
  static const card = Color(0xFF141C2F);
  static const fieldBg = Color(0xFF0D1220);

  // ── accents ───────────────────────────────────────────────────
  static const gold = Color(0xFFD4952A);
  static const goldLight = Color(0xFFE8AA3B);
  static const goldDark = Color(0xFFC4821A);
  static const teal = Color(0xFF1A6D8E);

  // ── semantic ──────────────────────────────────────────────────
  static const success = Color(0xFF10B981);
  static const error = Color(0xFFEF4444);
  static const errorDark = Color(0xFF7C1D1D);
  static const info = Color(0xFF3B82F6);
  static const warning = Color(0xFFF59E0B);
  static const indigo = Color(0xFF4F46E5);
  static const sky = Color(0xFF0EA5E9);

  // ── text ──────────────────────────────────────────────────────
  static const textPrimary = Color(0xFFF0ECE4);
  static const textSecondary = Color(0xFF7B8699);
  static const textMuted = Color(0xFF5E6E87);

  // ── borders ───────────────────────────────────────────────────
  static const border = Color(0xFF1E2B45);
  static const borderGold = Color(0x40D4952A);
  static const borderSubtle = Color(0xFF1A2035);

  // ── gradients ─────────────────────────────────────────────────
  static const goldGradient = LinearGradient(
    colors: [gold, goldDark],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const goldHorizontalGradient = LinearGradient(
    colors: [goldLight, gold],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
