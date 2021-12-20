# Building Properties Manager
_Models for handling structured building properties and clients to manage them - based on IFC_


# Scope
This project provides a way to manage a set of building properties, disconnected from the building model and without use of proprietary tools. It's aim is to be consistent enough to be parsable into several other formats, including IFC.

# TODO / Roadmap
 - Add remaining models to handle all IFC extensions of Property, Value and Unit
 - Finish remaining TODOs in code comments
 - Allow data to be exported as PropertyTemplates
 - Allow data to be exported straight into IFC files for use in design applications like Revit and ArchiCAD

# Honorable mentions
Some great projects working on making IFC more accessible for all of us:
 - [IFC.js](https://github.com/IFCjs): all kinds of implementations of IFC using JavaScript and WASM
 - [IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell): tools for working with IFC-files, with python bindings for the c++ libraries 
 - [ifcJSON](https://github.com/buildingSMART/ifcJSON): an actually readable IFC schema as JSON instead of EXPRESS.
