const UnauthorizedPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
    <h1 className="text-destructive-500 mb-4">403 - Unauthorized</h1>
    <p className="text-muted-foreground mb-8">You do not have permission to view this page.</p>
    <a href="/" className="btn btn-primary">Back to Dashboard</a>
  </div>
);

export default UnauthorizedPage;
