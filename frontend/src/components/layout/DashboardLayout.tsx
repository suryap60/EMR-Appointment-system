import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import type { RootState } from '../../redux/store';

const NavIcon = ({ path }: { path: string }) => (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
    </svg>
);

const DesktopToggle = ({ isCollapsed, toggle }: { isCollapsed: boolean, toggle: () => void }) => (
    <button
        onClick={toggle}
        className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm z-50 transition-colors"
    >
        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
        </svg>
    </button>
);

const DashboardLayout: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false);

    const handleLogout = () => {
        dispatch(logout());
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen flex bg-slate-50 fade-in relative">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between w-full h-16 bg-white border-b border-slate-200 px-4 absolute top-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg leading-none">
                        N
                    </div>
                    <h1 className="text-lg font-extrabold tracking-tight text-slate-900">NEXA EMR</h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 -mr-2 text-slate-600 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
                </button>
            </div>

            {/* Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 z-40 bg-white border-r border-slate-200 flex flex-col pt-6 pb-4 h-full md:h-screen transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} ${isDesktopCollapsed ? 'md:w-20' : 'md:w-64'}`}>

                <DesktopToggle isCollapsed={isDesktopCollapsed} toggle={() => setIsDesktopCollapsed(!isDesktopCollapsed)} />

                <div className={`px-6 mb-8 items-center gap-3 hidden md:flex ${isDesktopCollapsed ? 'justify-center px-0' : ''}`}>
                    <div className="w-10 h-10 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl leading-none">
                        N
                    </div>
                    {!isDesktopCollapsed && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">NEXA EMR</h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{user?.role || 'Staff'}</p>
                        </div>
                    )}
                </div>

                <div className="md:hidden px-6 mb-4 mt-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{user?.role || 'Staff'}</p>
                </div>

                <nav className="flex-1 w-full px-4 flex flex-col gap-1.5 pt-4 overflow-y-auto overflow-x-hidden">
                    <NavLink onClick={closeSidebar} title="Overview" to="/" end className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDesktopCollapsed ? 'px-0 justify-center md:px-3' : 'px-4'} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                        <NavIcon path="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        <span className={`whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : ''}`}>Overview</span>
                    </NavLink>
                    <NavLink onClick={closeSidebar} title="Appointments" to="/appointments" className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDesktopCollapsed ? 'px-0 justify-center md:px-3' : 'px-4'} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                        <NavIcon path="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        <span className={`whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : ''}`}>Appointments</span>
                    </NavLink>

                    {user?.role === 'SUPER_ADMIN' && (
                        <>
                            {!isDesktopCollapsed ? (
                                <p className="text-[10px] font-bold text-slate-400 mt-4 mb-2 px-4 uppercase tracking-wider whitespace-nowrap">Administration</p>
                            ) : (
                                <div className="h-px w-full bg-slate-200 my-3 hidden md:block"></div>
                            )}
                            <NavLink onClick={closeSidebar} title="Manage Doctors" to="/doctors" className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDesktopCollapsed ? 'px-0 justify-center md:px-3' : 'px-4'} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <NavIcon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                <span className={`whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : ''}`}>Manage Doctors</span>
                            </NavLink>
                            <NavLink onClick={closeSidebar} title="Manage Receptionists" to="/receptionists" className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDesktopCollapsed ? 'px-0 justify-center md:px-3' : 'px-4'} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <NavIcon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                <span className={`whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : ''}`}>Manage Receptionists</span>
                            </NavLink>
                            <NavLink onClick={closeSidebar} title="Doctor Schedules" to="/schedules" className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDesktopCollapsed ? 'px-0 justify-center md:px-3' : 'px-4'} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <NavIcon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <span className={`whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : ''}`}>Doctor Schedules</span>
                            </NavLink>
                        </>
                    )}

                    {user?.role === 'RECEPTIONIST' && (
                        <>
                            {!isDesktopCollapsed ? (
                                <p className="text-[10px] font-bold text-slate-400 mt-4 mb-2 px-4 uppercase tracking-wider whitespace-nowrap">Front Desk</p>
                            ) : (
                                <div className="h-px w-full bg-slate-200 my-3 hidden md:block"></div>
                            )}
                            <NavLink onClick={closeSidebar} title="Search Patients" to="/patients" className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDesktopCollapsed ? 'px-0 justify-center md:px-3' : 'px-4'} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <NavIcon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                <span className={`whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : ''}`}>Search Patients</span>
                            </NavLink>
                            <NavLink onClick={closeSidebar} title="Book Appointment" to="/scheduler" className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDesktopCollapsed ? 'px-0 justify-center md:px-3' : 'px-4'} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <NavIcon path="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <span className={`whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : ''}`}>Book Appointment</span>
                            </NavLink>
                        </>
                    )}

                    {user?.role === 'DOCTOR' && (
                        <>
                            {!isDesktopCollapsed ? (
                                <p className="text-[10px] font-bold text-slate-400 mt-4 mb-2 px-4 uppercase tracking-wider whitespace-nowrap">My Practice</p>
                            ) : (
                                <div className="h-px w-full bg-slate-200 my-3 hidden md:block"></div>
                            )}
                            <NavLink onClick={closeSidebar} title="My Patients" to="/mypatients" className={({ isActive }) => `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isDesktopCollapsed ? 'px-0 justify-center md:px-3' : 'px-4'} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <NavIcon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                <span className={`whitespace-nowrap ${isDesktopCollapsed ? 'md:hidden' : ''}`}>My Patients</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className={`mt-auto px-4 w-full ${isDesktopCollapsed ? 'flex flex-col gap-2 items-center px-0' : ''}`}>
                    <div className={`pt-4 border-t border-slate-100 mb-4 px-2 ${isDesktopCollapsed ? 'hidden md:hidden' : ''}`}>
                        <p className="text-sm font-semibold text-slate-800">{user?.name || 'Jane Doe'}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'jane@nexa.emr'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className={`text-sm flex items-center justify-center transition-colors ${isDesktopCollapsed ? 'w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600' : 'btn-secondary w-full'}`}
                    >
                        {isDesktopCollapsed ? (
                            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        ) : 'Sign out'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full p-4 pt-20 md:pt-8 md:p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
