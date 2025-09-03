// แปลง "YYYY-MM-DD" (หรือ ISO) -> Date แบบ local
export function parseDOBToLocalDate(dob?: string | null): Date | null {
    if (!dob) return null;
    const ymd = dob.slice(0, 10);
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if (!m) return null;
    const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
    const dt = new Date(y, mo, d); // local time
    return (dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === d) ? dt : null;
}

// "X ปี Y เดือน" / "น้อยกว่า 1 เดือน"
export function ageText(dob?: string | null): string {
    const birth = parseDOBToLocalDate(dob);
    if (!birth) return '';
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    if (years === 0 && months === 0) return 'น้อยกว่า 1 เดือน';
    const y = years > 0 ? `${years} ปี` : '';
    const m = months > 0 ? `${months} เดือน` : '';
    return [y, m].filter(Boolean).join(' ');
}
