// calculate developer skill level from code quality scores 

export function calculateSkillsLevel(codeQuality){
    if(!codeQuality) return "Beginner";

    const avg= (
        codeQuality.readabilty + 
        codeQuality.maintainability +
        codeQuality.security +
        codeQuality.performance ) /4;

    if(avg >=8) return "Advanced";
    if(avg >=6) return "Intermediate";
    return "Beginner";
}