const Dashboard = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1>Dashboard Overview</h1>
    </div>
    <div className="grid grid-cols-3 gap-6">
      <div className="card shadow">
        <h4 className="text-muted-foreground mb-2">Total Employees</h4>
        <p className="text-3xl font-bold">124</p>
      </div>
      <div className="card shadow">
        <h4 className="text-muted-foreground mb-2">Tasks Pending</h4>
        <p className="text-3xl font-bold">12</p>
      </div>
      <div className="card shadow">
        <h4 className="text-muted-foreground mb-2">Monthly Leads</h4>
        <p className="text-3xl font-bold">45</p>
      </div>
    </div>
  </div>
);

export default Dashboard;
