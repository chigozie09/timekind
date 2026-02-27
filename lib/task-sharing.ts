import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { TaskTemplate } from "@/lib/task-templates";

/**
 * Generate shareable template JSON
 */
export function generateShareableTemplate(template: TaskTemplate): string {
  return JSON.stringify(
    {
      type: "timekind-template",
      version: "1.0",
      template: {
        name: template.name,
        description: template.description,
        icon: template.icon,
        tasks: template.tasks,
      },
      sharedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

/**
 * Share template via system share sheet
 */
export async function shareTemplate(template: TaskTemplate): Promise<boolean> {
  try {
    const content = generateShareableTemplate(template);
    const filename = `${template.name.toLowerCase().replace(/\s+/g, "-")}-template.json`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(fileUri, content);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: `Share ${template.name} Template`,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to share template:", error);
    return false;
  }
}

/**
 * Parse shared template JSON
 */
export function parseSharedTemplate(
  jsonString: string
): TaskTemplate | null {
  try {
    const data = JSON.parse(jsonString);

    if (data.type !== "timekind-template" || !data.template) {
      return null;
    }

    const { template } = data;
    return {
      id: `shared-${Date.now()}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      tasks: template.tasks,
    };
  } catch {
    return null;
  }
}



/**
 * Generate template code for manual sharing
 */
export function generateTemplateCode(template: TaskTemplate): string {
  const code = `
// TimeKind Template: ${template.name}
// Copy and paste this into the app to import

const template = {
  name: "${template.name}",
  description: "${template.description}",
  icon: "${template.icon}",
  tasks: [
${template.tasks
  .map(
    (t) => `
    {
      taskName: "${t.taskName}",
      estimatedMinutes: ${t.estimatedMinutes},
      energyLevel: "${t.energyLevel}",
      category: "${t.category}"
    }
`
  )
  .join(",")}
  ]
};
`;
  return code.trim();
}
