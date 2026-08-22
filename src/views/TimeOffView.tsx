import { type UserRole, mockGetCurrentUser } from '../mockApi';
import EmployeeTimeOffView from './EmployeeTimeOffView';
import AdminTimeOffView from './AdminTimeOffView';

interface TimeOffViewProps {
  employeeId: string;
  userRole: UserRole | string;
}

export default function TimeOffView({ employeeId, userRole }: TimeOffViewProps) {
  const currentUser = mockGetCurrentUser();
  const displayName = currentUser?.user ? `${currentUser.user.firstName} ${currentUser.user.lastName}` : 'Employee';

  if (userRole === 'EMPLOYEE') {
    return (
      <EmployeeTimeOffView
        employeeId={employeeId}
        employeeName={displayName}
      />
    );
  }

  return (
    <AdminTimeOffView
      userRole={userRole as UserRole}
      userId={employeeId}
    />
  );
}
