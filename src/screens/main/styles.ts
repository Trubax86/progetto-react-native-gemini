import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.secondary,
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileHint: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text.primary,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  copyright: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
});
