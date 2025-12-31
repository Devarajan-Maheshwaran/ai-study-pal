import { ExternalLink, BookOpen, Video, FileText, Globe } from "lucide-react";

interface Resource {
  title: string;
  url: string;
  type: "article" | "video" | "course" | "website";
  description: string;
}

interface ResourceSuggestionsProps {
  subject: string;
}

const resourceDatabase: Record<string, Resource[]> = {
  mathematics: [
    { title: "Khan Academy - Math", url: "https://www.khanacademy.org/math", type: "course", description: "Free comprehensive math courses" },
    { title: "Wolfram Alpha", url: "https://www.wolframalpha.com", type: "website", description: "Computational knowledge engine" },
    { title: "3Blue1Brown", url: "https://www.youtube.com/@3blue1brown", type: "video", description: "Visual math explanations" },
  ],
  physics: [
    { title: "Physics Classroom", url: "https://www.physicsclassroom.com", type: "website", description: "Interactive physics tutorials" },
    { title: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/physics", type: "course", description: "Free university physics courses" },
    { title: "Veritasium", url: "https://www.youtube.com/@veritasium", type: "video", description: "Science and engineering videos" },
  ],
  chemistry: [
    { title: "Chemistry LibreTexts", url: "https://chem.libretexts.org", type: "article", description: "Open-access chemistry textbooks" },
    { title: "Tyler DeWitt", url: "https://www.youtube.com/@TylerDeWitt", type: "video", description: "Fun chemistry explanations" },
    { title: "Periodic Table", url: "https://ptable.com", type: "website", description: "Interactive periodic table" },
  ],
  biology: [
    { title: "Biology Online", url: "https://www.biologyonline.com", type: "article", description: "Biology dictionary and tutorials" },
    { title: "Crash Course Biology", url: "https://www.youtube.com/playlist?list=PL3EED4C1D684D3ADF", type: "video", description: "Engaging biology video series" },
    { title: "NCBI Resources", url: "https://www.ncbi.nlm.nih.gov", type: "website", description: "Biomedical research database" },
  ],
  "computer science": [
    { title: "freeCodeCamp", url: "https://www.freecodecamp.org", type: "course", description: "Learn to code for free" },
    { title: "CS50 Harvard", url: "https://cs50.harvard.edu", type: "course", description: "Intro to computer science" },
    { title: "GeeksforGeeks", url: "https://www.geeksforgeeks.org", type: "article", description: "Programming tutorials and practice" },
  ],
  history: [
    { title: "World History Encyclopedia", url: "https://www.worldhistory.org", type: "article", description: "Comprehensive history articles" },
    { title: "Crash Course History", url: "https://www.youtube.com/@crashcourse", type: "video", description: "Engaging history videos" },
    { title: "History.com", url: "https://www.history.com", type: "website", description: "Historical content and documentaries" },
  ],
  default: [
    { title: "Wikipedia", url: "https://www.wikipedia.org", type: "article", description: "Free online encyclopedia" },
    { title: "Coursera", url: "https://www.coursera.org", type: "course", description: "Online courses from universities" },
    { title: "YouTube EDU", url: "https://www.youtube.com/education", type: "video", description: "Educational video content" },
  ],
};

const getIcon = (type: Resource["type"]) => {
  switch (type) {
    case "article":
      return FileText;
    case "video":
      return Video;
    case "course":
      return BookOpen;
    case "website":
      return Globe;
  }
};

const ResourceSuggestions = ({ subject }: ResourceSuggestionsProps) => {
  const resources = resourceDatabase[subject.toLowerCase()] || resourceDatabase.default;

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">
        Recommended Resources
      </h3>
      <div className="space-y-3">
        {resources.map((resource, index) => {
          const Icon = getIcon(resource.type);
          return (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {resource.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceSuggestions;
