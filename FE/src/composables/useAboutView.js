import logo from '../assets/logo.jpeg';

export function useAboutView() {
  const teamMembers = [
    {
      name: "Abu Harris M",
      nim: "2350081144",
      role: "Fullstack Developer",
      roleType: "tech",
      email: "abuharris@mendingmana.id",
      bgColor: "bg-slate-800 shadow-slate-500/20"
    },
    {
      name: "Lucky Aditiya",
      nim: "2350081142",
      role: "Fullstack Developer",
      roleType: "tech",
      email: "lucky@mendingmana.id",
      bgColor: "bg-purple-600 shadow-purple-500/20"
    },
    {
      name: "Safa Salsabila",
      nim: "2350081134",
      role: "Frontend Developer",
      roleType: "design",
      email: "safa@mendingmana.id",
      bgColor: "bg-amber-500 shadow-amber-500/20"
    },
    {
      name: "Luthfiena Nur Kamila",
      nim: "2350081138",
      role: "Frontend Developer",
      roleType: "design",
      email: "luthfiena@mendingmana.id",
      bgColor: "bg-emerald-600 shadow-emerald-500/20"
    }
  ];

  function getInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.slice(0, 2).toUpperCase();
  }

  return {
    logo,
    teamMembers,
    getInitials
  };
}
