const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function BeaconMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="10" r="4.3" stroke="var(--signal-amber, #d9820f)" strokeWidth="2" />
      <circle cx="12" cy="10" r="1.3" fill="var(--signal-amber, #d9820f)" />
      <path d="M12 16.5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SunIcon(props) { return (<svg {...base} {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>); }
export function MoonIcon(props) { return (<svg {...base} {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>); }
export function TodayIcon(props) { return (<svg {...base} {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>); }
export function UpcomingIcon(props) { return (<svg {...base} {...props}><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M8 14h2M8 17h5"/></svg>); }
export function InboxIcon(props) { return (<svg {...base} {...props}><path d="M4 12h4l1.5 2.5h5L16 12h4"/><path d="M5.5 5h13L21 12v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6L5.5 5Z"/></svg>); }
export function ListIcon(props) { return (<svg {...base} {...props}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>); }
export function PlusIcon(props) { return (<svg {...base} {...props}><path d="M12 5v14M5 12h14"/></svg>); }
export function MenuIcon(props) { return (<svg {...base} {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>); }
export function CloseIcon(props) { return (<svg {...base} {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>); }
export function LogOutIcon(props) { return (<svg {...base} {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>); }
export function ChevronDownIcon(props) { return (<svg {...base} {...props}><path d="m6 9 6 6 6-6"/></svg>); }
export function TrashIcon(props) { return (<svg {...base} {...props}><path d="M4 7h16"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/><path d="M6 7l1 13a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9l1-13"/></svg>); }
export function EditIcon(props) { return (<svg {...base} {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>); }
export function CheckIcon(props) { return (<svg {...base} {...props}><path d="M20 6 9 17l-5-5"/></svg>); }
export function CalendarIcon(props) { return (<svg {...base} {...props}><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>); }
export function HashIcon(props) { return (<svg {...base} {...props}><path d="M9 3 7 21M17 3l-2 18M4 8.5h16M3.5 15.5h16"/></svg>); }
export function AlertIcon(props) { return (<svg {...base} {...props}><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L14.7 3.86a2 2 0 0 0-3.4 0Z"/></svg>); }
export function EyeIcon(props) { return (<svg {...base} {...props}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>); }
export function EyeOffIcon(props) { return (<svg {...base} {...props}><path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.1-6.1M9.9 4.2A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.2 4.4M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M1 1l22 22"/></svg>); }
