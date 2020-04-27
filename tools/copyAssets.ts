import * as shell from "shelljs";

// Copy all cypher files
shell.cp( "-R", "src/cypher", "dist/" );