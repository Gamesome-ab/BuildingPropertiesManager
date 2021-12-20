# Building Properties Manager
_Models for handling structured building properties and clients to manage them - based on IFC_

# What's this?
This project provides a way to manage a set of building properties, disconnected from the building model and without use of proprietary tools. It's aim is to be consistent enough to be parsable into several other formats, including IFC.

# Usage guide
The data is stored along side the tools (clients) that are used to manage it. The data is stored as JSON in */store* and models and data managers are collected under */src/data*.
## For developers
TBD

## For property managers
TBD

# Contributing
Wondering how contributions work in the in our project? Here's a quick rundown!

 1. Find an issue that you are interested in addressing or a feature that you would like to add.
 2. Fork the repository to your local GitHub user / organization. 
 3. Create a new branch for your fix.
 4. Make the appropriate changes for the issue you are trying to address or the feature that you want to add.
 5. Push the changes to your remote repository  and submit a pull request to the upstream repository.
 6. Title the pull request with a short description of the changes made and the issue or bug number associated with your change.
 7. In the description of the pull request, explain the changes that you made, any issues you think exist with the pull request you made, and any questions you have for the maintainer. It's OK if your pull request is not perfect (no pull request is), the reviewer will be able to help you fix any problems and improve it!
 8. Wait for the pull request to be reviewed by a maintainer.
 9. Make changes to the pull request if the reviewing maintainer recommends them.
 10. Celebrate your success after your pull request is merged!

# TODO / Roadmap
 - Add remaining models to handle all IFC extensions of Property, Value and Unit
 - Finish remaining TODOs in code comments
 - Allow data to be exported as PropertyTemplates
 - Allow data to be exported straight into IFC files for use in design applications like Revit and ArchiCAD
  - IDEA: add [json-server](https://github.com/typicode/json-server) to be able to serve the data as REST API.

# Honorable mentions
Some great projects working on making IFC more accessible for all of us:
 - [IFC.js](https://github.com/IFCjs): all kinds of implementations of IFC using JavaScript and WASM
 - [IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell): tools for working with IFC-files, with python bindings for the c++ libraries 
 - [ifcJSON](https://github.com/buildingSMART/ifcJSON): an actually readable IFC schema as JSON instead of EXPRESS.
