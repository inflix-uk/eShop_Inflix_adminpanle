import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";
import {
  fetchSuperadminControls,
  updateSuperadminControls,
} from "./service/superadminControlsService";

const normalizeRoutePath = (value) =>
  String(value || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();

export default function SuperadminDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [controls, setControls] = useState({
    adminRouteModules: [],
    disabledAdminRoutes: [],
    updatedAt: null,
  });
  const [newModule, setNewModule] = useState({
    label: "",
    description: "",
    routesInput: "",
  });
  const [moduleRouteDrafts, setModuleRouteDrafts] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState("");

  const handleLogout = () => {
    auth.logout();
    navigate("/admin/superadmin", { replace: true });
  };

  const fullName = `${auth?.user?.firstname || ""} ${auth?.user?.lastname || ""}`.trim();

  useEffect(() => {
    let mounted = true;
    const loadControls = async () => {
      setLoading(true);
      const data = await fetchSuperadminControls();
      if (mounted && data) {
        setControls(data);
        setSelectedModuleId(data.adminRouteModules?.[0]?.id || "");
        setModuleRouteDrafts(
          (data.adminRouteModules || []).reduce((acc, module) => {
            acc[module.id] = (module.routes || []).join("\n");
            return acc;
          }, {})
        );
      }
      if (mounted) setLoading(false);
    };
    loadControls();
    return () => {
      mounted = false;
    };
  }, []);

  const isModuleEnabled = (module) => module?.enabled !== false;

  const toggleModule = (moduleId) => {
    const modules = [...(controls.adminRouteModules || [])];
    const idx = modules.findIndex((module) => module.id === moduleId);
    if (idx === -1) return;
    modules[idx] = { ...modules[idx], enabled: !(modules[idx].enabled !== false) };
    setControls((prev) => ({ ...prev, adminRouteModules: modules }));
  };

  const parseRoutes = (value) =>
    value
      .split("\n")
      .map((line) => normalizeRoutePath(line))
      .filter(Boolean);

  const addModule = () => {
    const label = newModule.label.trim();
    const routes = parseRoutes(newModule.routesInput);
    if (!label || routes.length === 0) {
      return;
    }
    const id = `${label.toLowerCase().replace(/[^a-z0-9-_]+/g, "-")}-${Date.now()}`;
    const nextModule = {
      id,
      label,
      description: newModule.description.trim(),
      routes,
      enabled: true,
    };
    setControls((prev) => ({
      ...prev,
      adminRouteModules: [...(prev.adminRouteModules || []), nextModule],
    }));
    setSelectedModuleId(id);
    setModuleRouteDrafts((prev) => ({
      ...prev,
      [id]: routes.join("\n"),
    }));
    setNewModule({ label: "", description: "", routesInput: "" });
  };

  const removeModule = (moduleId) => {
    const modules = controls.adminRouteModules || [];
    const moduleToRemove = modules.find((module) => module.id === moduleId);
    const removedRoutes = new Set(
      (moduleToRemove?.routes || []).map((route) => normalizeRoutePath(route))
    );
    const remainingModules = modules.filter((module) => module.id !== moduleId);
    setControls((prev) => ({
      ...prev,
      adminRouteModules: remainingModules,
      disabledAdminRoutes: (prev.disabledAdminRoutes || []).filter(
        (route) => !removedRoutes.has(normalizeRoutePath(route))
      ),
    }));
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(remainingModules[0]?.id || "");
    }
    setModuleRouteDrafts((prev) => {
      const next = { ...prev };
      delete next[moduleId];
      return next;
    });
  };

  const updateModuleField = (moduleId, field, value) => {
    setControls((prev) => ({
      ...prev,
      adminRouteModules: (prev.adminRouteModules || []).map((module) =>
        module.id === moduleId ? { ...module, [field]: value } : module
      ),
    }));
  };

  const updateModuleRouteDraft = (moduleId, routesInput) => {
    setModuleRouteDrafts((prev) => ({
      ...prev,
      [moduleId]: routesInput,
    }));
  };

  const syncDisabledRoutesFromModules = (modules) => {
    const nextDisabled = new Set();
    (modules || []).forEach((module) => {
      const routes = (module.routes || []).map(normalizeRoutePath);
      if (module.enabled === false) {
        routes.forEach((route) => nextDisabled.add(route));
      }
    });
    return [...nextDisabled];
  };

  const handleSave = async () => {
    setSaving(true);
    const modulesToSave = (controls.adminRouteModules || []).map((module) => {
      const draftValue = moduleRouteDrafts[module.id];
      const routes =
        draftValue !== undefined ? parseRoutes(draftValue) : module.routes || [];
      return { ...module, routes };
    });
    const nextDisabledAdminRoutes = syncDisabledRoutesFromModules(
      modulesToSave
    );
    const data = await updateSuperadminControls({
      adminRouteModules: modulesToSave,
      disabledAdminRoutes: nextDisabledAdminRoutes,
    });
    if (data) {
      setControls(data);
      setModuleRouteDrafts(
        (data.adminRouteModules || []).reduce((acc, module) => {
          acc[module.id] = (module.routes || []).join("\n");
          return acc;
        }, {})
      );
    }
    setSaving(false);
  };

  const selectedModule =
    (controls.adminRouteModules || []).find((module) => module.id === selectedModuleId) || null;

  return (
<div className="min-h-screen bg-gray-50">

{/* Header */}
<header className="bg-white border-b">
  <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
    <h1 className="font-semibold">Superadmin</h1>

    <button
      onClick={handleLogout}
      className="text-sm font-medium px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      Logout
    </button>
  </div>
</header>

<main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

  {/* Top Bar */}
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-lg font-semibold">Modules</h2>
      <p className="text-xs text-gray-500">
        Control admin access
      </p>
    </div>

    <button
      onClick={handleSave}
      disabled={saving}
      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 text-sm rounded-md transition"
    >
      {saving ? "Saving..." : "Save"}
    </button>
  </div>

  {/* Table */}
  <div className="bg-white border rounded-lg overflow-hidden">
    <table className="w-full text-sm">
      <thead className="bg-gray-100 text-gray-600 text-xs">
        <tr>
          <th className="text-left px-4 py-2">Module</th>
          <th className="text-left px-4 py-2">Routes</th>
          <th className="text-center px-4 py-2">Enabled</th>
          <th className="text-right px-4 py-2">Action</th>
        </tr>
      </thead>

      <tbody>
        {(controls.adminRouteModules || []).map((module) => {
          const enabled = isModuleEnabled(module);

          return (
            <tr key={module.id} className="border-t">

              {/* Name */}
              <td className="px-4 py-3">
                <p className="font-medium">{module.label}</p>
                <p className="text-xs text-gray-400">
                  {module.description}
                </p>
              </td>

              {/* Routes */}
              <td className="px-4 py-3">
                <textarea
                  rows={4}
                  value={
                    moduleRouteDrafts[module.id] !== undefined
                      ? moduleRouteDrafts[module.id]
                      : (module.routes || []).join(", ")
                  }
                  onChange={(e) =>
                    updateModuleRouteDraft(module.id, e.target.value)
                  }
                  className="w-full text-xs border rounded px-2 py-1"
                />
              </td>

              {/* Toggle */}
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleModule(module.id)}
                />
              </td>

              {/* Remove */}
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => removeModule(module.id)}
                  className="text-xs text-red-500"
                >
                  Delete
                </button>
              </td>

            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {/* Add Module */}
  <div className="bg-white border rounded-lg p-4 space-y-3">
    <h3 className="text-sm font-medium">Add Module</h3>

    <div className="grid grid-cols-3 gap-3">
      <input
        placeholder="Name"
        value={newModule.label}
        onChange={(e) =>
          setNewModule((p) => ({ ...p, label: e.target.value }))
        }
        className="border px-2 py-1 text-sm rounded"
      />

      <input
        placeholder="Description"
        value={newModule.description}
        onChange={(e) =>
          setNewModule((p) => ({ ...p, description: e.target.value }))
        }
        className="border px-2 py-1 text-sm rounded"
      />

      <input
        placeholder="/admin/example"
        value={newModule.routesInput}
        onChange={(e) =>
          setNewModule((p) => ({ ...p, routesInput: e.target.value }))
        }
        className="border px-2 py-1 text-sm rounded"
      />
    </div>

    <button
      onClick={addModule}
      className="bg-black text-white px-3 py-1 text-sm rounded"
    >
      Add
    </button>
  </div>

</main>
</div>
  );
}
