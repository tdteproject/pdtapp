import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '@/presentation/themes/colors';
export default function LoadingSpinner() {
    return (<View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary.main}/>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
    }
});
