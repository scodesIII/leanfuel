import { useThemeColor } from '@/hooks/useThemeColor';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';



interface FeatureItemProps {
  icon: any;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIconContainer, { backgroundColor: `${primaryColor}20` }]}>
        <Ionicons name={icon} size={24} color={primaryColor} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={[styles.featureTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: textColor }]}>{description}</Text>
      </View>
    </View>
  );
};

export default FeatureItem;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  decorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  circleDecoration: {
    position: 'absolute',
    borderRadius: 1000,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  appName: {
    marginTop: 20,
    fontSize: 36,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    marginBottom: 12,
  },
});