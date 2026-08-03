import React from 'react';
import {
  Avatar, Badge, Box, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Stack, Tooltip, Typography,
} from '@mui/material';
import {
  AutoAwesome, BarChart, History, Key, Logout, Notifications, People, Settings,
} from '@mui/icons-material';

const DRAWER_WIDTH = 248;
const DEFAULT_NAV_ITEMS = [
  { key: 'customers', label: 'Khách hàng', icon: People },
  { key: 'reports', label: 'Báo cáo', icon: BarChart },
  { key: 'settings', label: 'Cài đặt', icon: Settings },
  { key: 'reminders', label: 'Nhắc việc', icon: Notifications, badge: 4 },
  { key: 'history', label: 'Lịch sử', icon: History },
];

export default function CrmHeader({
  userName = 'Administrator', title = 'Quản lý chăm sóc khách hàng',
  activeNav = 'customers', navItems = DEFAULT_NAV_ITEMS, onNavChange,
  onChangePassword, onLogout,
}) {
  const content = <>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2.5, py: 2.25 }}>
      <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}><AutoAwesome /></Avatar>
      <Box><Typography fontWeight={700}>Chăm sóc KH</Typography><Typography variant="caption" color="text.secondary">Customer workspace</Typography></Box>
    </Stack>
    <Divider />
    {/*<Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>*/}
    {/*  <Typography variant="overline" color="text.secondary">Không gian làm việc</Typography>*/}
    {/*  <Typography variant="h6" fontWeight={700} lineHeight={1.25}>{title}</Typography>*/}
    {/*</Box>*/}
    <List sx={{ px: 1.5, flex: 1 }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return <ListItemButton key={item.key} selected={activeNav === item.key} onClick={() => onNavChange?.(item.key)} sx={{ borderRadius: 8, mb: .5, '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.dark' } }}>
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.badge ? <Badge badgeContent={item.badge} color="error"><Icon /></Badge> : <Icon />}</ListItemIcon>
          <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeNav === item.key ? 700 : 500 }} />
        </ListItemButton>;
      })}
    </List>
    <Divider />
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ p: 2 }}>
      <Avatar sx={{ width: 38, height: 38, bgcolor: 'secondary.main' }}>{userName[0]?.toUpperCase()}</Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="body2" fontWeight={700} noWrap>{userName}</Typography><Typography variant="caption" color="text.secondary">Quản trị hệ thống</Typography></Box>
      <Tooltip title="Đổi mật khẩu"><IconButton size="small" onClick={onChangePassword}><Key fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Đăng xuất"><IconButton size="small" color="error" onClick={onLogout}><Logout fontSize="small" /></IconButton></Tooltip>
    </Stack>
  </>;

  return <>
    <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: 'background.paper', borderRightColor: 'divider' } }}>{content}</Drawer>
    <Box component="nav" sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', zIndex: 1300, left: 0, right: 0, bottom: 0, height: 68, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', justifyContent: 'space-around' }}>
      {navItems.map((item) => { const Icon = item.icon; const active = activeNav === item.key; return <IconButton key={item.key} onClick={() => onNavChange?.(item.key)} color={active ? 'primary' : 'default'} sx={{ flexDirection: 'column', borderRadius: 2, fontSize: 10 }}><Icon /><span>{item.label}</span></IconButton>; })}
    </Box>
  </>;
}
