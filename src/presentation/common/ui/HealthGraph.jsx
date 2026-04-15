import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';
import * as d3 from 'd3-shape';
import { colors } from '@/presentation/themes/colors';
import { fontFamily, fontSize, fontWeight } from '@/presentation/themes/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Reusable time-series graph for health metrics.
 * Uses d3-shape for smooth bezier curves and SVG for high-performance rendering.
 */
export default function HealthGraph({
    data = [], // Array of { label, value }
    height = 220,
    color = colors.primary.main,
    yUnit = '',
}) {
    if (!data || data.length === 0) return null;

    const PADDING_TOP = 40;
    const PADDING_BOTTOM = 30;
    const PADDING_SIDE = 16;
    const graphWidth = SCREEN_WIDTH - (PADDING_SIDE * 2) - 32; // Assuming padding inside card
    const graphHeight = height - PADDING_TOP - PADDING_BOTTOM;

    // Find min and max
    const maxValue = Math.max(...data.map(d => d.value), 10); // Floor of 10 to prevent flatline at 0
    const minValue = 0;

    // Scale helpers
    const scaleX = (index) => (index / (data.length - 1)) * graphWidth;
    const scaleY = (val) => graphHeight - ((val - minValue) / (maxValue - minValue)) * graphHeight;

    // Build curve points
    const mappedData = data.map((d, i) => [scaleX(i), scaleY(d.value)]);

    // D3 line generator with smoothing
    const lineGenerator = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => d[0])
        .y(d => d[1]);

    // D3 area generator for the gradient fill beneath the curve
    const areaGenerator = d3.area()
        .curve(d3.curveMonotoneX)
        .x(d => d[0])
        .y0(graphHeight)
        .y1(d => d[1]);

    const linePath = lineGenerator(mappedData);
    const areaPath = areaGenerator(mappedData);

    return (
        <View style={[styles.container, { height }]}>
            {/* Header / Y-Axis context */}
            <View style={styles.topContext}>
                <Text style={styles.axisLabel}>{maxValue} {yUnit}</Text>
            </View>

            <View style={styles.graphWrapper}>
                <Svg width={graphWidth} height={graphHeight} style={styles.svg}>
                    <Defs>
                        <SvgGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                            <Stop offset="1" stopColor={color} stopOpacity="0.0" />
                        </SvgGradient>
                    </Defs>

                    {/* Area Fill */}
                    <Path d={areaPath} fill="url(#fillGradient)" />

                    {/* Smooth Line */}
                    <Path d={linePath} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />

                    {/* Data Points */}
                    {mappedData.map((d, i) => (
                        <Circle key={i} cx={d[0]} cy={d[1]} r={4} fill="#FFFFFF" stroke={color} strokeWidth={2} />
                    ))}
                </Svg>

                {/* X-Axis Labels */}
                <View style={[styles.xAxis, { width: graphWidth }]}>
                    {data.map((d, i) => (
                        <Text key={i} style={styles.xAxisLabel}>
                            {d.label}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    topContext: {
        paddingHorizontal: 16,
        paddingTop: 16,
        alignItems: 'flex-end',
    },
    graphWrapper: {
        flex: 1,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    svg: {
        overflow: 'visible',
    },
    axisLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.xs,
        color: colors.text.muted,
    },
    xAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    xAxisLabel: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.micro,
        color: colors.text.muted,
        width: 30,
        textAlign: 'center',
    },
});
