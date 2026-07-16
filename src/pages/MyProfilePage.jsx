import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

function initials(username) {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

export default function MyProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
              {initials(user?.username)}
            </span>
            <div>
              <CardTitle className="text-lg">{user?.username}</CardTitle>
              <CardDescription>My Profile</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Username</p>
            <p className="text-sm text-foreground">{user?.username}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Roles</p>
            <div className="flex flex-wrap gap-1.5">
              {user?.roles?.length ? (
                user.roles.map((roleName) => (
                  <Badge key={roleName} variant="secondary">
                    {roleName}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-foreground">—</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Tenant</p>
            <p className="text-sm text-foreground">{user?.restaurantId ?? '—'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
