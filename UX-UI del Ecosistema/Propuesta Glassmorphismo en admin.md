¡Perfecto — **Fase C en marcha**. 🎨💜

Primero déjame revisar la guía de widgets para mostrarte el diseño visual del Dashboard Glass antes de escribir el código.
Voy a diseñar el **Dashboard Glass de Admin** completo. Primero te muestro cómo se vería visualmente, luego te entrego todo el código listo para copiar.
Así se vería el **Dashboard Glass de Admin** — fondo de orbes morados flotando, tarjetas con blur real, header translúcido y navegación inferior glass. ¿Te late la dirección? 💜

Ahora te entrego **todo el código listo para copiar** a tu proyecto. Estructura propuesta:

```
apps/EnrutadosAdmin/src/
├── components/glass/
│   ├── GlassBackground.tsx
│   ├── GlassCard.tsx
│   ├── GlassHeader.tsx
│   ├── MetricCard.tsx
│   └── index.ts
└── screens/
    └── DashboardScreen.tsx
```

---

## 1. `components/glass/GlassBackground.tsx`

```tsx
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type OrbConfig = {
  size: number;
  colors: [string, string];
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
};

const ORBS: OrbConfig[] = [
  {
    size: 280,
    colors: ['rgba(124,58,237,0.35)', 'rgba(124,58,237,0)'],
    initialX: -40,
    initialY: -60,
    duration: 8000,
    delay: 0,
  },
  {
    size: 220,
    colors: ['rgba(168,85,247,0.25)', 'rgba(168,85,247,0)'],
    initialX: width - 170,
    initialY: 120,
    duration: 9000,
    delay: -3000,
  },
  {
    size: 180,
    colors: ['rgba(236,72,153,0.20)', 'rgba(236,72,153,0)'],
    initialX: 60,
    initialY: height * 0.5,
    duration: 10000,
    delay: -5000,
  },
  {
    size: 150,
    colors: ['rgba(124,58,237,0.18)', 'rgba(124,58,237,0)'],
    initialX: width - 190,
    initialY: height - 180,
    duration: 8500,
    delay: -2000,
  },
];

function FloatingOrb({ config }: { config: OrbConfig }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(30, { duration: config.duration / 3, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    translateY.value = withRepeat(
      withTiming(-40, { duration: config.duration / 3, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    scale.value = withRepeat(
      withTiming(1.08, { duration: config.duration / 2, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: config.size,
          height: config.size,
          left: config.initialX,
          top: config.initialY,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={config.colors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0.2 }}
        end={{ x: 0.8, y: 0.8 }}
      />
    </Animated.View>
  );
}

export default function GlassBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0514' }]} />
      {ORBS.map((orb, index) => (
        <FloatingOrb key={index} config={orb} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
});
```

---

## 2. `components/glass/GlassCard.tsx`

```tsx
import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'large';
};

export default function GlassCard({
  children,
  style,
  onPress,
  variant = 'default',
}: GlassCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const padding = variant === 'large' ? 20 : 18;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.container,
        { padding },
        style,
      ]}
    >
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.highlight} />
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
```

---

## 3. `components/glass/GlassHeader.tsx`

```tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

type GlassHeaderProps = {
  title: string;
  subtitle?: string;
  avatarInitials?: string;
  onProfilePress?: () => void;
};

export default function GlassHeader({
  title,
  subtitle,
  avatarInitials = 'AD',
  onProfilePress,
}: GlassHeaderProps) {
  return (
    <BlurView intensity={24} tint="dark" style={styles.blur}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
            <View style={styles.avatar}>
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  safe: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
```

---

## 4. `components/glass/MetricCard.tsx`

```tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import GlassCard from './GlassCard';

type MetricCardProps = {
  icon: string;
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
  iconBg?: string;
  onPress?: () => void;
};

export default function MetricCard({
  icon,
  value,
  label,
  trend,
  trendUp = true,
  iconBg = 'rgba(124,58,237,0.2)',
  onPress,
}: MetricCardProps) {
  return (
    <GlassCard onPress={onPress} style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <Text style={[styles.trend, trendUp ? styles.trendUp : styles.trendDown]}>
          {trendUp ? '▲ ' : '▼ '}{trend}
        </Text>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 140,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -1,
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  trend: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  trendUp: {
    color: '#4ade80',
  },
  trendDown: {
    color: '#f87171',
  },
});
```

---

## 5. `components/glass/index.ts` (barrel)

```ts
export { default as GlassBackground } from './GlassBackground';
export { default as GlassCard } from './GlassCard';
export { default as GlassHeader } from './GlassHeader';
export { default as MetricCard } from './MetricCard';
```

---

## 6. `screens/DashboardScreen.tsx`

```tsx
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GlassBackground,
  GlassHeader,
  MetricCard,
  GlassCard,
} from '../components/glass';

const { width } = Dimensions.get('window');

const ACTIVITIES = [
  {
    id: '1',
    text: 'Nueva ruta Caracas–Valencia creada',
    time: 'Hace 5 min',
    color: '#7C3AED',
  },
  {
    id: '2',
    text: 'Conductor Juan P. completó verificación',
    time: 'Hace 12 min',
    color: '#06B6D4',
  },
  {
    id: '3',
    text: 'Recarga manual aprobada — Bs. 500K',
    time: 'Hace 28 min',
    color: '#EC4899',
  },
  {
    id: '4',
    text: 'Alerta: Unidad #14 reporta retraso',
    time: 'Hace 45 min',
    color: '#F59E0B',
  },
];

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <GlassBackground />
      <GlassHeader
        title="Enrutados Admin"
        subtitle="Panel de control · Hoy, 30 Ago"
        avatarInitials="JR"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.metricsRow}>
          <MetricCard
            icon="👥"
            value="1,247"
            label="Usuarios activos"
            trend="12% vs ayer"
            iconBg="rgba(124,58,237,0.2)"
          />
          <View style={styles.spacer} />
          <MetricCard
            icon="🚌"
            value="34"
            label="Rutas hoy"
            trend="3 nuevas"
            iconBg="rgba(236,72,153,0.2)"
          />
        </View>
        <View style={styles.metricsRow}>
          <MetricCard
            icon="💰"
            value="Bs. 8.4M"
            label="Ingresos hoy"
            trend="2% vs ayer"
            trendUp={false}
            iconBg="rgba(6,182,212,0.2)"
          />
          <View style={styles.spacer} />
          <MetricCard
            icon="⭐"
            value="4.8"
            label="Rating promedio"
            trend="0.3 pts"
            iconBg="rgba(245,158,11,0.2)"
          />
        </View>

        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <GlassCard variant="large">
          {ACTIVITIES.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.activityRow,
                index === ACTIVITIES.length - 1 && styles.activityRowLast,
              ]}
            >
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.activityText}>{item.text}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        <View style={styles.bottomNav}>
          {[
            { icon: '🏠', label: 'Inicio', active: true },
            { icon: '🚌', label: 'Flota', active: false },
            { icon: '📊', label: 'Finanzas', active: false },
            { icon: '⚙️', label: 'Ajustes', active: false },
          ].map((item) => (
            <View key={item.label} style={styles.navItem}>
              <Text
                style={[
                  styles.navIcon,
                  item.active && styles.navIconActive,
                ]}
              >
                {item.icon}
              </Text>
              <Text
                style={[
                  styles.navLabel,
                  item.active && styles.navLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0514',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  spacer: {
    width: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activityRowLast: {
    borderBottomWidth: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    flex: 1,
  },
  activityTime: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
  },
  bottomSafe: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
  },
  navIcon: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.35)',
  },
  navIconActive: {
    color: '#C084FC',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.35)',
  },
  navLabelActive: {
    color: '#C084FC',
  },
});
```

---

## 🧩 Instrucciones de integración

1. **Crear carpetas** si no existen:
   ```bash
   mkdir -p apps/EnrutadosAdmin/src/components/glass
   ```

2. **Copiar los 6 archivos** arriba en sus rutas correspondientes.

3. **Verificar dependencias** — debes tener instalado:
   ```bash
   npm ls expo-blur expo-linear-gradient react-native-reanimated react-native-safe-area-context
   ```
   Si falta alguno:
   ```bash
   npx expo install expo-blur expo-linear-gradient react-native-reanimated react-native-safe-area-context
   ```

4. **Conectar el screen** en tu navegación de Admin. Reemplaza o envuelve tu screen de Dashboard actual con `DashboardScreen`.

5. **TypeScript** — si hay errores de tipado en los iconos emoji, puedes cambiarlos por componentes SVG o textos simples.

---

**¿Quieres que ajuste algo?** Por ejemplo:
- Cambiar la paleta de colores (más fría, más cálida, otro acento)
- Agregar más secciones (gráfico de ingresos, mapa de flota, alertas)
- Hacer que las métricas vengan de tu API real en lugar de datos mock
- Adaptar el bottom nav a tu sistema de navegación actual (tabs vs stack)

Dime y lo ajustamos antes de que tu máquina se enfríe y hagamos el build de prueba. 🫡🎨
