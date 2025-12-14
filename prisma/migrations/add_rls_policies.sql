-- Row-Level Security (RLS) Policies for Multi-Tenant Data Isolation
-- ===== MULTI-TENANT: Implementar isolamento de dados via RLS =====

-- 1. Enable RLS on Organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organizations
CREATE POLICY "Users can view their own organizations"
  ON organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = organizations.id
      AND user_organizations."userId" = auth.uid()::text
    )
  );

-- Organizations: Only admins can update their organization
CREATE POLICY "Admins can update their organization"
  ON organizations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = organizations.id
      AND user_organizations."userId" = auth.uid()::text
      AND user_organizations.role = 'admin'
    )
  );

-- 2. Enable RLS on UserOrganization table
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- UserOrganization: Users can only see their own organization memberships
CREATE POLICY "Users can view their own memberships"
  ON user_organizations
  FOR SELECT
  USING ("userId" = auth.uid()::text);

-- UserOrganization: Only admins can insert new memberships
CREATE POLICY "Admins can add new members"
  ON user_organizations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations uo2
      WHERE uo2."organizationId" = "organizationId"
      AND uo2."userId" = auth.uid()::text
      AND uo2.role = 'admin'
    )
  );

-- 3. Enable RLS on Leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Leads: Users can only see leads from their organization
CREATE POLICY "Users can view leads from their organization"
  ON leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = leads."organizationId"
      AND user_organizations."userId" = auth.uid()::text
    )
  );

-- Leads: Users can only create leads in their organization
CREATE POLICY "Users can create leads in their organization"
  ON leads
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = "organizationId"
      AND user_organizations."userId" = auth.uid()::text
    )
  );

-- Leads: Users can only update leads from their organization
CREATE POLICY "Users can update leads from their organization"
  ON leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = "organizationId"
      AND user_organizations."userId" = auth.uid()::text
    )
  );

-- 4. Enable RLS on Appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Appointments: Users can only see appointments from their organization
CREATE POLICY "Users can view appointments from their organization"
  ON appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = "organizationId"
      AND user_organizations."userId" = auth.uid()::text
    )
  );

-- Appointments: Users can only create appointments in their organization
CREATE POLICY "Users can create appointments in their organization"
  ON appointments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = "organizationId"
      AND user_organizations."userId" = auth.uid()::text
    )
  );

-- Appointments: Users can only update appointments from their organization
CREATE POLICY "Users can update appointments from their organization"
  ON appointments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = "organizationId"
      AND user_organizations."userId" = auth.uid()::text
    )
  );

-- 5. Enable RLS on MetricEvents table
ALTER TABLE metric_events ENABLE ROW LEVEL SECURITY;

-- MetricEvents: Users can only see metric events from their organization
CREATE POLICY "Users can view metric events from their organization"
  ON metric_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = "organizationId"
      AND user_organizations."userId" = auth.uid()::text
    )
  );

-- MetricEvents: Users can only create metric events in their organization
CREATE POLICY "Users can create metric events in their organization"
  ON metric_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations."organizationId" = "organizationId"
      AND user_organizations."userId" = auth.uid()::text
    )
  );
