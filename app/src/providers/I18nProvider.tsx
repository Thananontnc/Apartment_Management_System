'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'th';

interface I18nContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        dashboard: 'Dashboard',
        properties: 'Properties',
        utility_manager: 'Utility Manager',
        billing_payments: 'Billing & Payments',
        add_property: 'Add Property',
        record_meters: 'Record Meters',
        save_readings: 'Save Readings & Generate Invoices',
        occupancy_rate: 'Occupancy Rate',
        projected_revenue: 'Projected Revenue',
        rooms: 'Rooms',
        status: 'Status',
        action: 'Action',
        back_to_dashboard: 'Back to Dashboard',
        back_to_properties: 'Back to Properties',
        back_to_selection: 'Back to Selection',
        login: 'Login',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        welcome: 'Welcome back. Here is your business at a glance.',
        quick_actions: 'Quick Actions',
        property_overview: 'Property Overview',
        record_meters_desc: 'Record meters and generate invoices for this month.',
        manage_rooms_desc: 'Add new rooms, adjust rent prices, or add new buildings.',
        mark_paid_desc: 'Manage collections and mark payments.',
        edit_property_info: 'Edit Property Info',
        add_room: 'Add Room',
        bulk_add_rooms: 'Bulk Add Rooms',
        room_number: 'Room #',
        floor: 'Floor',
        rent: 'Rent',
        elec_rate: 'Elec Rate',
        water_rate: 'Water Rate',
        def_rent: 'Def. Rent',
        save_changes: 'Save Changes',
        vacant: 'Vacant',
        occupied: 'Occupied',
        maintenance: 'Maintenance',
        paid: 'PAID',
        unpaid: 'UNPAID',
        cash: 'Cash',
        qr_code: 'QR Code',
        completed: 'Completed',
        total: 'Total',
        elec: 'Elec',
        water: 'Water',
        finance: 'Finance',
        net_profit: 'Net Profit',
        operating_expenses: 'Operating Expenses',
        bank_loan_mortgage: 'Bank Loan / Mortgage',
        monthly_repayment: 'Monthly Repayment',
        financial_health: 'Financial Health',
        expected_profit: 'Expected Profit',
        actual_profit: 'Actual Profit',
        staff_salary: 'Staff Salary',
        taxes: 'Taxes',
        other_costs: 'Other Costs',
        collection_rate: 'Collection Rate',
        outstanding_debt: 'Outstanding Debt',
        collected_revenue: 'Collected Revenue',
    },
    th: {
        dashboard: 'แดชบอร์ด',
        properties: 'ทรัพย์สิน',
        utility_manager: 'จัดการค่าน้ำค่าไฟ',
        billing_payments: 'การเรียกเก็บเงินและการชำระเงิน',
        add_property: 'เพิ่มสถานที่',
        record_meters: 'จดมิเตอร์',
        save_readings: 'บันทึกมิเตอร์และสร้างใบแจ้งหนี้',
        occupancy_rate: 'อัตราการเข้าพัก',
        projected_revenue: 'รายได้โดยประมาณ',
        rooms: 'ห้อง',
        status: 'สถานะ',
        action: 'ดำเนินการ',
        back_to_dashboard: 'กลับไปที่แดชบอร์ด',
        back_to_properties: 'กลับหน้าจัดการหอพัก',
        back_to_selection: 'กลับหน้าเลือกหอพัก',
        login: 'เข้าสู่ระบบ',
        logout: 'ออกจากระบบ',
        email: 'อีเมล',
        password: 'รหัสผ่าน',
        welcome: 'ยินดีต้อนรับกลับมา นี่คือภาพรวมธุรกิจของคุณ',
        quick_actions: 'ทางลัด',
        property_overview: 'ภาพรวมทรัพย์สิน',
        record_meters_desc: 'จดมิเตอร์ไฟฟ้าและน้ำเพื่อสร้างใบแจ้งหนี้สำหรับเดือนนี้',
        manage_rooms_desc: 'เพิ่มห้องใหม่ ปรับราคาเช่า หรือเพิ่มอาคารใหม่',
        mark_paid_desc: 'จัดการภาระการชำระเงินและทำเครื่องหมายว่าจ่ายแล้ว',
        edit_property_info: 'แก้ไขข้อมูลสถานที่',
        add_room: 'เพิ่มห้อง',
        bulk_add_rooms: 'เพิ่มห้องจำนวนมาก',
        room_number: 'เลขห้อง',
        floor: 'ชั้น',
        rent: 'ค่าเช่า',
        elec_rate: 'อัตราค่าไฟ',
        water_rate: 'อัตราค่าน้ำ',
        def_rent: 'ค่าเช่าเริ่มต้น',
        save_changes: 'บันทึกการเปลี่ยนแปลง',
        vacant: 'ว่าง',
        occupied: 'มีคนอยู่',
        maintenance: 'ปรับปรุง',
        paid: 'จ่ายแล้ว',
        unpaid: 'ค้างชำระ',
        cash: 'เงินสด',
        qr_code: 'คิวอาร์โค้ด',
        completed: 'เสร็จสิ้น',
        total: 'รวมทั้งสิ้น',
        elec: 'ไฟฟ้า',
        water: 'น้ำ',
        finance: 'การเงิน',
        net_profit: 'กำไรสุทธิ',
        operating_expenses: 'ค่าใช้จ่ายการดำเนินงาน',
        bank_loan_mortgage: 'เงินกู้ธนาคาร / จำนอง',
        monthly_repayment: 'ค่างวดรายเดือน',
        financial_health: 'สุขภาพการเงิน',
        expected_profit: 'กำไรที่คาดหวัง',
        actual_profit: 'กำไรจริง',
        staff_salary: 'เงินเดือนพนักงาน',
        taxes: 'ภาษี',
        other_costs: 'ค่าใช้จ่ายอื่นๆ',
        collection_rate: 'อัตราการเรียกเก็บเงิน',
        outstanding_debt: 'หนี้ค้างชำระ',
        collected_revenue: 'รายรับที่เก็บได้จริง',
    }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>('th');

    useEffect(() => {
        const saved = localStorage.getItem('lang') as Language;
        if (saved) setLang(saved);
    }, []);

    const toggleLang = (newLang: Language) => {
        setLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    const t = (key: string) => {
        return (translations[lang] as any)[key] || key;
    };

    return (
        <I18nContext.Provider value={{ lang, setLang: toggleLang, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used within I18nProvider');
    return context;
}
