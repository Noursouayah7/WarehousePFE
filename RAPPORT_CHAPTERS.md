\chapter{General Introduction}
\newpage

\section{General Project Framework}

\subsection{Introduction}

In this section, we establish the foundational context of the project by presenting the host organization, defining the problem domain, and analyzing existing solutions. We also introduce the proposed solution and the adopted development methodology.

\subsection{Host Organization Presentation}

\subsubsection{General Overview}

This project was carried out at \textbf{Cerebro Solutions}, a company specializing in digital transformation, intelligent systems, and data-driven solutions.

The company focuses on integrating modern technologies such as artificial intelligence, business intelligence, and web platforms to optimize industrial and business processes.

\begin{figure}[h!]
    \centering
    \includegraphics[width=0.35\textwidth]{chapters/assets/logo_cerebro.jpeg}
    \caption{Logo of Cerebro Solutions}
    \label{fig:logo_Cerebro}
\end{figure}

\subsubsection{Activities and Services}

Cerebro Solutions provides a comprehensive range of services tailored to enterprise digital transformation:

\begin{itemize}
    \item Development of AI-powered applications
    \item Business Intelligence and analytics solutions
    \item Web/Mobile and enterprise platforms
    \item Data engineering and optimization
\end{itemize}

\subsubsection{Contact Information}

For more information about Cerebro Solutions and its services, please contact:

\begin{itemize}
    \item \textbf{Website}: www.cerebrosolutions.tn
    \item \textbf{Email}: info@cerebrosolutions.tn
    \item \textbf{Location}: Tunis, Tunisia
\end{itemize}

\subsection{General Context and Problem Statement}

Warehouse management in industrial environments, especially in olive oil production factories, faces several critical challenges:

\begin{itemize}
    \item Lack of real-time inventory visibility
    \item Inefficient order processing workflows
    \item Poor demand forecasting capabilities
    \item Limited decision-support tools
    \item Risk of stock overflow or shortage
\end{itemize}

These limitations directly impact operational efficiency, profitability, and decision-making quality. Traditional inventory management systems often fail to provide the intelligence and flexibility required in modern industrial operations.

\subsection{Study of Existing Solutions}

To properly position the proposed platform within the olive oil production software ecosystem, a comprehensive study of existing solutions has been conducted. This analysis focuses on both generic Enterprise Resource Planning (ERP) systems adapted for food production and specialized inventory management platforms specifically designed for olive oil production and processing.

Modern management systems play a central role in enterprise digital transformation by integrating multiple business processes. However, solutions differ significantly in terms of flexibility, specialization for olive oil production, AI integration, usability, and cost efficiency.

The objective of this study is to evaluate industry-specific solutions alongside conventional ERP systems to identify their strengths and limitations, and to highlight the added value introduced by our proposed system, particularly through artificial intelligence, business intelligence, and customization for olive oil production environments.

\subsubsection*{Evaluation Criteria}

The comparative analysis is based on the following criteria, selected for their relevance to olive oil production and inventory management:

\begin{itemize}
    \item \textbf{Real-time inventory management}: capability to track harvest, processing, storage, and finished goods stock;
    \item \textbf{Production and harvesting planning}: efficiency in managing cultivation, harvest timing, and milling operations;
    \item \textbf{Traceability from orchard to bottle}: complete supply chain tracking and regulatory compliance;
    \item \textbf{Artificial intelligence integration}: presence of demand forecasting and intelligent decision-support mechanisms;
    \item \textbf{Business Intelligence capabilities}: ability to visualize production metrics, costs, and profitability;
    \item \textbf{Usability and user experience}: simplicity for field workers, technicians, and managers;
    \item \textbf{Cost and deployment complexity}: financial and technical effort required for implementation and maintenance.
\end{itemize}

\subsubsection*{Specialized Olive Oil Production Solutions}

\subsubsection*{OliveSuite}

OliveSuite is a specialized platform designed for olive oil producers, offering real-time olive oil prices based on actual producer data, along with global price tracking. The platform provides comprehensive cost analysis and production metrics.

\textbf{Strengths:}
\begin{itemize}
    \item Specialized production cost calculator that computes cost per kilogram and liter, including cultivation costs, harvest costs, and milling expenses;
    \item Market price analysis by oil type (conventional, organic, biodynamic) with historical price trends and regional filtering;
    \item Designed specifically for olive oil producers with industry-relevant metrics;
    \item Real-time pricing intelligence for informed decision-making.
\end{itemize}

\textbf{Limitations:}
\begin{itemize}
    \item Limited inventory management for processing and storage phases;
    \item Focus primarily on cost analysis and market pricing rather than operational workflow management;
    \item Lacks integrated order management and customer relationship features;
    \item No built-in artificial intelligence for demand forecasting or optimization.
\end{itemize}

\subsubsection*{GestOli}

GestOli is a management system for accounting and traceability in the olive oil industry that simplifies red tape for olive growers, producers, and packaging companies.

\textbf{Strengths:}
\begin{itemize}
    \item First online system specifically for accounting management in the olive oil industry;
    \item Enables remote monitoring of premises and online submission of monthly activity statements to Control Boards;
    \item Supports digital sign-off on procedures with legal validity;
    \item Regulatory compliance and transparency features.
\end{itemize}

\textbf{Limitations:}
\begin{itemize}
    \item Primarily focuses on accounting and compliance rather than inventory management;
    \item Limited operational workflow automation;
    \item No predictive analytics or business intelligence capabilities;
    \item Designed more for regulatory reporting than operational efficiency.
\end{itemize}

\subsubsection*{Vertical Olive Mill (Odoo Module)}

The Vertical Olive Mill is an open-source Odoo module that manages olive mill operations, providing full traceability from orchard to oil bottle and supporting multiple types of olive oil production.

\textbf{Strengths:}
\begin{itemize}
    \item Comprehensive traceability covering orchard parcels, cultivation methods, olive farmer management, pressing operations, and oil tank management;
    \item Open-source, allowing customization and integration with broader Odoo ERP ecosystem;
    \item Automated invoice generation and press ratio calculations per farmer, arrival, and campaign;
    \item Multi-stakeholder support for farmers and mill operators.
\end{itemize}

\textbf{Limitations:}
\begin{itemize}
    \item Requires Odoo infrastructure and technical expertise for implementation;
    \item Limited standalone functionality—requires full Odoo ERP setup;
    \item No native artificial intelligence or advanced predictive analytics;
    \item Requires significant customization for olive oil production factories.
\end{itemize}

\subsubsection*{Thrive Inventory (Manufacturing Focus)}

Thrive Inventory provides inventory management with manufacturing capabilities through an Assemblies tool that deducts ingredient and material stock levels at time of creation.

\textbf{Strengths:}
\begin{itemize}
    \item Designed for manufacturing with batch costing capabilities to track actual production costs across different production runs;
    \item Multi-channel inventory tracking across warehouses, storefronts, and e-commerce;
    \item User-friendly interface with strong reporting capabilities;
    \item Scalable for growing businesses.
\end{itemize}

\textbf{Limitations:}
\begin{itemize}
    \item Generic manufacturing tool not specialized for olive oil production;
    \item Limited traceability and regulatory compliance features;
    \item No demand forecasting or advanced predictive analytics;
    \item Does not address orchard-to-mill workflow specific to olive oil production.
\end{itemize}

\subsubsection*{Generic ERP Solutions}

\subsubsection*{SAP S/4HANA}

SAP S/4HANA is a leading enterprise ERP solution adapted for food and beverage production. It provides a highly integrated environment covering production, supply chain, and logistics.

\textbf{Strengths:}
\begin{itemize}
    \item Comprehensive and highly integrated enterprise architecture;
    \item Strong support for large-scale industrial operations;
    \item Real-time analytics and data consistency across modules.
\end{itemize}

\textbf{Limitations:}
\begin{itemize}
    \item Extremely high licensing and implementation cost (prohibitive for SMEs);
    \item Significant system complexity requiring specialized expertise;
    \item Long deployment and customization cycles;
    \item Generic solution not optimized for olive oil production workflows;
    \item Limited built-in artificial intelligence for prediction and optimization.
\end{itemize}

\subsubsection*{Odoo ERP}

Odoo is an open-source ERP platform widely adopted by small and medium-sized enterprises. It provides modular business applications including inventory, manufacturing, and sales.

\textbf{Strengths:}
\begin{itemize}
    \item Modular and highly flexible architecture;
    \item Cost-effective compared to proprietary ERP systems;
    \item User-friendly and customizable interface;
    \item Specialized Odoo module (Vertical Olive Mill) available for olive production.
\end{itemize}

\textbf{Limitations:}
\begin{itemize}
    \item Limited scalability for large industrial environments;
    \item Advanced functionalities often require paid extensions;
    \item Limited native artificial intelligence and predictive models;
    \item Requires significant customization and technical expertise to tailor for olive oil production.
\end{itemize}

\subsubsection*{Oracle NetSuite}

Oracle NetSuite is a cloud-based ERP solution designed for medium and large enterprises, providing integrated management of supply chain and inventory.

\textbf{Strengths:}
\begin{itemize}
    \item Scalable cloud-based infrastructure;
    \item Strong integration of business processes;
    \item High availability and cross-platform accessibility.
\end{itemize}

\textbf{Limitations:}
\begin{itemize}
    \item High recurring subscription costs;
    \item Complex customization and configuration processes;
    \item Generic solution not specialized for agricultural or olive oil production;
    \item Limited built-in predictive intelligence without additional modules.
\end{itemize}



\subsection{Critical Analysis of Existing Solutions}

Although existing solutions provide valuable functionality for olive oil producers, they exhibit significant limitations when addressing the comprehensive needs of modern olive oil production factories.

\textbf{Specialized Olive Oil Solutions:} Platforms like OliveSuite excel at pricing analysis and cost calculation, while GestOli focuses on regulatory compliance and traceability. However, these solutions operate in silos without integrated inventory management, production workflow automation, or business intelligence dashboards. OliveSuite provides market price data and production cost metrics, but lacks real-time operational management. GestOli simplifies regulatory requirements and traceability, but does not address daily operational efficiency or demand forecasting.

\textbf{Generic ERP Limitations:} Traditional ERP systems (SAP, Oracle NetSuite) provide comprehensive functionality but suffer from prohibitively high costs for small and medium-sized enterprises, complexity in deployment, and lack of specialization for agricultural workflows. These systems are not optimized for the unique requirements of olive production, such as orchard management, seasonal harvesting, pressing optimization, and quality-based pricing.

\textbf{AI and Predictive Analytics Gap:} None of the existing solutions integrate artificial intelligence for demand forecasting, production optimization, or intelligent decision support. This is a critical gap in the market, as olive oil producers must manage complex seasonal variations, varying yield rates, and volatile market prices.

In this context, the proposed Intelligent Inventory Management Platform introduces a comprehensive, adaptive, and intelligent solution specifically designed for olive oil production environments. Unlike existing solutions, it integrates:

\begin{itemize}
    \item \textbf{End-to-end traceability} from orchard management through processing to finished goods;
    \item \textbf{Artificial intelligence capabilities} for demand forecasting and production optimization;
    \item \textbf{Real-time operational workflows} for harvest management, pressing, storage, and order fulfillment;
    \item \textbf{Business Intelligence dashboards} for production metrics, cost analysis, and profitability tracking;
    \item \textbf{Cost efficiency} suitable for small and medium-sized olive oil production facilities;
    \item \textbf{User accessibility} for diverse stakeholders including field workers, technicians, and managers.
\end{itemize}

This positions the proposed solution as a unique offering that bridges the gap between generic ERP systems and specialized olive oil tools, while introducing the intelligence and adaptability required for competitive modern production.

\subsubsection*{Comparative Analysis Table}

\begin{table}[H]
\centering
\normalsize
\setlength{\tabcolsep}{6pt}
\renewcommand{\arraystretch}{1.8}

\resizebox{\textwidth}{!}{%
\begin{tabular}{|p{4.8cm}|c|c|c|c|c|c|c|}
\hline
\textbf{Evaluation Criteria} &
\textbf{OliveSuite} &
\textbf{GestOli} &
\textbf{Vertical Olive Mill} &
\textbf{SAP S/4HANA} &
\textbf{Odoo ERP} &
\textbf{Oracle NetSuite} &
\textbf{Proposed Solution} \\
\hline

Real-time inventory management
& \checkmark & $\times$ & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark \\
\hline

Orchard-to-bottle traceability
& \checkmark & \checkmark & \checkmark & $\sim$ & $\sim$ & $\sim$ & \checkmark \\
\hline

Production planning
& $\times$ & $\times$ & \checkmark & \checkmark & \checkmark & \checkmark & \checkmark \\
\hline

Artificial intelligence integration
& $\times$ & $\times$ & $\times$ & $\times$ & $\times$ & $\times$ & \checkmark \\
\hline

Business Intelligence dashboards
& $\sim$ & $\times$ & $\times$ & \checkmark & \checkmark & \checkmark & \checkmark \\
\hline

Usability for field workers
& \checkmark & $\times$ & $\times$ & $\times$ & \checkmark & $\times$ & \checkmark \\
\hline

Cost efficiency for SMEs
& \checkmark & \checkmark & \checkmark & $\times$ & \checkmark & $\times$ & \checkmark \\
\hline

\end{tabular}%
}

\caption{Comparative Analysis of Existing Olive Oil Production and ERP Solutions}
\label{tab:olive_erp_comparison}
\end{table}

\begin{center}
\normalsize
\textbf{Legend:}
\checkmark\ Full Support \hspace{1.5cm}
$\sim$\ Partial Support \hspace{1.5cm}
$\times$\ No Support
\end{center}

\subsection{Proposed Solution}

To address the limitations identified in existing Enterprise Resource Planning (ERP) and inventory management systems, we propose the development of an \textbf{Intelligent Inventory Management Platform}. This system is designed to enhance operational efficiency, improve decision-making, and provide predictive capabilities tailored to industrial environments such as olive oil production factories.

Unlike traditional ERP solutions, the proposed platform is designed with a \textbf{user-centric and adaptive architecture}, ensuring that functionalities can be personalized according to the operational needs of each stakeholder.

The system integrates the following key components:

\begin{itemize}
    \item An AI-powered assistant to support users in operational decision-making;
    \item A predictive analytics module for demand forecasting and stock optimization;
    \item Business Intelligence dashboards for real-time data visualization and reporting;
    \item A role-based access control system (Administrator, Manager, Technician, Customer);
    \item Real-time inventory tracking and workflow management.
\end{itemize}

\subsection{Study of Development Methodologies}

The use of a structured development methodology is essential to ensure effective project management, improved software quality, and increased productivity throughout the system development lifecycle. Selecting an appropriate methodology is therefore a critical step in any software engineering project.

Among the various existing approaches, this study focuses on a comparison between the most widely used methodologies: \textbf{Scrum}, \textbf{RUP (Rational Unified Process)}, and \textbf{2TUP (Two Track Unified Process)}.

\subsubsection{Scrum}

Scrum is one of the most widely adopted Agile methodologies in modern software development. It is an iterative and incremental framework that organizes development into short cycles called \textit{sprints}. Each sprint produces a potentially usable increment of the system.

Scrum defines a set of roles, events, and artifacts that structure the development process and ensure continuous delivery. However, despite its popularity, Scrum is not universally applicable and may not be suitable for all types of projects. It is particularly effective in dynamic environments where requirements evolve frequently, such as web applications and intelligent systems.

\textbf{Strengths of Scrum:}
\begin{itemize}
    \item Strong focus on customer needs and continuous feedback;
    \item Encourages collaboration and team communication;
    \item High flexibility in response to changing requirements;
    \item Incremental and continuous delivery of functional software.
\end{itemize}

\textbf{Weaknesses of Scrum:}
\begin{itemize}
    \item Lack of strict hierarchical structure, which may lead to ambiguity in responsibilities;
    \item Testing and integration activities are not explicitly defined as separate phases;
    \item Limited scalability for very large teams;
    \item Can be challenging to master in complex environments.
\end{itemize}

\subsubsection{Rational Unified Process (RUP)}

The Rational Unified Process (RUP) is an iterative and model-driven software development methodology based on object-oriented principles. It provides a structured framework covering the entire software lifecycle, from requirements analysis to deployment.

RUP is highly documentation-oriented and emphasizes architecture definition and risk management. Although it provides a rigorous and well-structured process, it can introduce significant complexity, particularly for small and medium-sized projects.

\textbf{Strengths of RUP:}
\begin{itemize}
    \item Strong collaboration between stakeholders and development teams;
    \item Extensive documentation ensuring traceability;
    \item Architecture-centric approach with strong risk management;
    \item Production of high-quality deliverables;
    \item Adaptability to evolving requirements.
\end{itemize}

\textbf{Weaknesses of RUP:}
\begin{itemize}
    \item High implementation and operational cost;
    \item Complex process management and versioning;
    \item Heavy methodology not suitable for small-scale projects;
    \item Requires experienced personnel for effective use.
\end{itemize}

\subsubsection{Two Track Unified Process (2TUP)}

2TUP is a software development methodology based on a unified process model in which each phase of the lifecycle is derived from the previous one. It follows an iterative and incremental approach, emphasizing the separation between functional and technical concerns.

The process begins with requirement capture and evolves through successive refinements until system deployment. Each iteration contributes to the progressive construction of the final system.

\textbf{Strengths of 2TUP:}
\begin{itemize}
    \item Iterative and incremental development approach;
    \item Strong focus on technical architecture and risk management;
    \item Well-defined roles, deliverables, and planning structure;
    \item Encourages prototyping and progressive validation.
\end{itemize}

\textbf{Weaknesses of 2TUP:}
\begin{itemize}
    \item Limited detail in early requirement analysis phases;
    \item Weak support for maintenance and post-deployment activities;
    \item Lack of standardized documentation templates;
    \item Less commonly used in modern agile environments.
\end{itemize}

\subsection{Selection of the Appropriate Methodology}

The development of the proposed Intelligent Inventory Management Platform requires a structured yet flexible approach capable of adapting to evolving requirements while ensuring continuous delivery of functional components.

After a thorough analysis of the available methodologies, \textbf{Scrum was selected as the most suitable approach} for this project. This choice is motivated by its iterative nature, strong emphasis on collaboration, and ability to support continuous improvement throughout the development lifecycle.

Scrum is particularly well aligned with the nature of the proposed system, which integrates multiple evolving components such as artificial intelligence modules, business intelligence dashboards, and real-time inventory management features.

We therefore adopt and adapt the Scrum framework to guide the development process throughout the project lifecycle, ensuring effective communication, flexibility, and incremental delivery of functionalities.

\subsubsection{Scrum Events Planning}

The Scrum framework is structured around key events that organize the development process and ensure continuous collaboration:

\begin{itemize}
    \item \textbf{Sprint Planning}: A meeting held at the beginning of each sprint where the team commits to completing a set of user stories from the product backlog. This ensures clarity on sprint objectives and workload distribution.
    
    \item \textbf{Daily Standup}: A brief 15-minute daily meeting where team members report on completed work, planned work, and any impediments. This promotes transparency and quick issue resolution.
    
    \item \textbf{Sprint Review}: Conducted at the end of each sprint, this event demonstrates completed work to stakeholders and gathers feedback for future improvements.
    
    \item \textbf{Sprint Retrospective}: A meeting where the team reflects on the sprint process and identifies opportunities for improvement in collaboration, communication, and technical practices.
\end{itemize}

These events create a rhythm of predictability and opportunities for inspection and adaptation throughout the project lifecycle.

\subsubsection{Fundamental Principles of Scrum}

The Scrum methodology is built upon several core principles that guide team behavior and decision-making:

\begin{itemize}
    \item \textbf{Empiricism}: Scrum relies on transparency, inspection, and adaptation. Decisions are based on observed facts and concrete evidence.
    
    \item \textbf{Iterative Development}: The system is developed incrementally through a series of short cycles (sprints), each producing a potentially shippable product increment.
    
    \item \textbf{Customer Collaboration}: Regular feedback from stakeholders ensures that the product meets actual business needs and adapts to changing requirements.
    
    \item \textbf{Team Empowerment}: Cross-functional, self-organizing teams are responsible for determining how to achieve sprint goals, promoting ownership and accountability.
    
    \item \textbf{Continuous Improvement}: Through retrospectives and feedback loops, the team continuously identifies and implements process improvements.
\end{itemize}

Figure~\ref{fig:scrum_cycle} illustrates the Scrum lifecycle adopted in this project.

\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{chapters/assets/scrum-schema1.png}
\caption{Scrum methodology lifecycle}
\label{fig:scrum_cycle}
\end{figure}

\subsection{Project Planning}

The proposed Intelligent Inventory Management Platform is developed within a four-month internship period. To ensure a structured, controlled, and methodical execution, the project follows the classical phases of the software development lifecycle, namely: system analysis, requirements specification, design, implementation, testing, and final deployment.

In parallel, an Agile Scrum-based approach is adopted to ensure iterative development and continuous delivery of functional increments. This allows for better adaptability to evolving requirements and progressive validation of system components.

To visualize the overall execution plan, a \textbf{Gantt chart} is used as a project management tool. It provides a clear representation of the project timeline, task distribution, and sprint sequencing across the entire development period. This ensures better tracking of progress and facilitates early identification of potential delays.

Figure~\ref{fig:gantt_chart} illustrates the overall project planning.


\section{Development Tools and Technologies}

\subsection{Development Tools}

The following development tools are utilized to support the software development process, collaboration, and project management:

\begin{itemize}
    \item \textbf{Git}: Version control system for managing code repositories and enabling collaborative development.
    
    \item \textbf{GitHub}: Cloud-based platform for hosting Git repositories and facilitating team collaboration.
    
    \item \textbf{Visual Studio Code}: Lightweight, feature-rich code editor used by the development team for writing and debugging code.
    
    \item \textbf{Thunder}: API testing tool for validating backend endpoints and ensuring proper integration.
    
    
    \item \textbf{PostgreSQL}: Relational database management system for persistent data storage.
    
    \item \textbf{Prisma}: Object-Relational Mapping (ORM) tool for simplifying database interactions and query management.
\end{itemize}

\subsection{Technologies Used}

The system is built using a modern, scalable technology stack optimized for performance and maintainability:

\subsubsection*{Backend}

\begin{itemize}
    \item \textbf{NestJS}: Progressive Node.js framework for building efficient, scalable server-side applications with TypeScript support.
    
    \item \textbf{PostgreSQL}: Robust relational database providing ACID compliance and advanced data management capabilities.
    
    \item \textbf{Prisma ORM}: Modern database access layer providing type-safe database queries and automated migrations.
\end{itemize}

\subsubsection*{Frontend}

\begin{itemize}
    \item \textbf{Next.js}: React-based framework with App Router for building fast, scalable web applications with server-side rendering and static generation.
    
    \item \textbf{React}: JavaScript library for building interactive user interfaces with component-based architecture.
    
    \item \textbf{TypeScript}: Typed superset of JavaScript enabling better code quality and developer experience.
    
    \item \textbf{Tailwind CSS}: Utility-first CSS framework for rapid UI development and consistent styling.
\end{itemize}

\subsubsection*{Authentication and Security}

\begin{itemize}
    \item \textbf{JWT (JSON Web Tokens)}: Stateless authentication mechanism for securing API endpoints and user sessions.
    
    \item \textbf{Bcrypt}: Cryptographic hashing library for secure password storage and validation.
\end{itemize}

\subsubsection*{Artificial Intelligence and Analytics}

\begin{itemize}
    \item \textbf{Python}: High-level programming language for implementing predictive analytics and machine learning models.
    
    \item \textbf{TensorFlow/Scikit-learn}: Libraries for building and training machine learning models for demand forecasting.
    
    \item \textbf{Pandas}: Data manipulation and analysis library for processing operational data.
\end{itemize}

\subsubsection*{Deployment and Infrastructure}

\begin{itemize}
    \item \textbf{Vercel}: Cloud platform for deploying Next.js frontend applications with automatic scaling and optimization.
    
    \item \textbf{Heroku/AWS}: Cloud services for hosting backend APIs and managing database infrastructure.
    
    \item \textbf{Docker}: Containerization for consistent deployment across development, testing, and production environments.
\end{itemize}

\section{Conclusion}

This chapter presented the global context of the project, including the problem definition, proposed solution, system architecture, development methodology, and project planning. The chapter was structured to provide a comprehensive overview of the organizational context, existing solutions analysis, and the technical approach adopted for system development.

The adoption of an Agile Scrum approach ensures an iterative development process, continuous improvement, and alignment with user requirements. The comprehensive analysis of existing ERP solutions highlighted the unique value proposition of the proposed intelligent inventory management platform, particularly in its integration of artificial intelligence, cost efficiency, and suitability for small and medium-sized enterprises.

The next chapter will focus on the detailed specification of system requirements, functional analysis, and architectural design patterns.

_____________________________________________________________________

\chapter{Sprint 0: Specification and Planning}
\label{chap2}

\newpage

\section{Introduction}

This chapter presents the analysis, specification, and planning phases of the Intelligent Inventory Management Platform developed for olive oil warehouse operations.

This chapter presents the analysis, specification, and planning phases for the Intelligent Inventory Management Platform targeting olive oil warehouse operations.

This phase identifies business requirements, system actors and functionalities, organizes the project using Scrum, and defines the platform's technical architecture.

The platform is a role-based warehouse management system enabling inventory supervision, warehouse organization, customer order management, shipment processing, support ticket handling, and an NLP-based chatbot (LLM) for intelligent assistance.

This chapter also presents the Scrum organization adopted during development, the product backlog, sprint planning, release organization, CRISP-DM methodology integration for the AI prediction module, and the global software architecture of the system.

\section{Requirement Analysis and Specification}

\subsection{Requirement Identification}

The Intelligent Inventory Management Platform was designed to digitalize and optimize warehouse operations while ensuring secure role-based access control and operational traceability.

The system supports multiple operational workflows including:

\begin{itemize}
    \item User onboarding and role assignment
    \item Warehouse and bloc management
    \item Product and inventory management
    \item Customer order lifecycle management
    \item Shipment and restocking workflows
    \item Support ticket management
    \item Intelligent warehouse assistant chatbot
    \item Predictive analytics preparation for inventory forecasting
\end{itemize}

\subsection{System Actors}

The platform defines the following actors:

\begin{itemize}
    \item \textbf{Administrator}: Responsible for user management, role assignment, warehouse and bloc configuration, product management, and interacting with the intelligent assistant.

    \item \textbf{Manager}: Responsible for operational workflows including order validation, shipment management, inventory supervision, and interaction with the intelligent assistant.
    
    \item \textbf{Technician}: Responsible for inventory operations, product placement, stock movement, and support ticket creation.
    
    \item \textbf{Customer}: Responsible for browsing products, placing orders, and tracking deliveries.
    
    \item \textbf{Pending User}: Newly registered user awaiting administrator approval and role assignment.
    
    \item \textbf{Visitor}: Public user with access only to the landing page and public platform information.
\end{itemize}

\subsection{Functional Requirements}

The functional requirements are organized according to system actors.

\subsubsection{Administrator Functional Requirements}

The administrator can:

\begin{itemize}
    \item Create and manage user accounts
    \item Assign and modify user roles
    \item Approve pending users
    \item Manage warehouses and blocs
    \item Manage products and inventory configurations
    \item Access the intelligent assistant chatbot
    \item Manage support tickets
    \item Manage personal profile information
\end{itemize}

\subsubsection{Manager Functional Requirements}

The manager can:

\begin{itemize}
    \item View warehouse inventory levels
    \item Manage customer orders
    \item Approve or reject orders
    \item Trigger restock requests
    \item Manage shipments
    \item Monitor delivery workflows
    \item Access the intelligent assistant chatbot
    \item Manage personal profile information
\end{itemize}

\subsubsection{Technician Functional Requirements}

The technician can:

\begin{itemize}
    \item View warehouse and bloc inventory levels
    \item Move products between blocs
    \item Update inventory quantities
    \item Create support tickets
    \item Manage personal profile information
\end{itemize}

\subsubsection{Customer Functional Requirements}

The customer can:

\begin{itemize}
    \item Browse available products
    \item View product  prices
    \item Place multi-product orders
    \item Track order and shipment status
    \item Manage personal profile information
\end{itemize}

\subsubsection{Pending User Functional Requirements}

The pending user can:

\begin{itemize}
    \item Access the pending approval interface
    \item Wait for administrator validation
\end{itemize}

\subsubsection{Visitor Functional Requirements}

The visitor can:

\begin{itemize}
    \item Access the landing page
    \item View public platform information
    \item Register or authenticate into the platform
\end{itemize}

\subsection{Non-Functional Requirements}

The platform must satisfy the following non-functional requirements:

\begin{itemize}
    \item \textbf{Security}: Secure authentication using JWT and bcrypt password hashing.
    
    \item \textbf{Scalability}: Modular backend architecture supporting future AI and analytics integration.
    
    \item \textbf{Performance}: Optimized database queries and transactional inventory operations.
    
    \item \textbf{Usability}: Responsive and role-oriented interfaces adapted to each actor.
    
    \item \textbf{Reliability}: Inventory consistency and validation of warehouse capacity constraints.
    
    \item \textbf{Maintainability}: Separation of concerns using modular NestJS architecture.
    
    \item \textbf{Availability}: Continuous access to operational services and warehouse data.
\end{itemize}

\section{Global Use Case Diagram}

The following use case diagram presents the overall interactions between system actors and the platform.

\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{chapters/assets/use_case_diagram.png}
\caption{Global Use Case Diagram}
\label{fig:global_usecase}
\end{figure}

\section{Global Class Diagram}

The following class diagram illustrates the main entities and relationships of the system.

\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{chapters/assets/global_class_diagram.png}
\caption{Global Class Diagram}
\label{fig:global_class}
\end{figure}


\section{Project Management Methodology}

\subsection{Adopted Methodology}

The project was developed using the Agile Scrum methodology.

Scrum was selected because it supports iterative development, continuous feedback, progressive feature delivery, and flexibility during implementation.

The project organization is based on:

\begin{itemize}
    \item Sprint planning
    \item Daily standup meetings
    \item Sprint reviews
    \item Sprint retrospectives
    \item Incremental product delivery
\end{itemize}

\subsection{Scrum Team Structure}

The Scrum team for this project is composed of the following members:

\begin{itemize}
    \item \textbf{Product Owner – Aziz Jemai}: Responsible for defining business requirements, prioritizing the product backlog, validating functionalities, and ensuring alignment with operational objectives.
    
    \item \textbf{Scrum Master – Anwar Romdhani}: Responsible for organizing Scrum ceremonies, monitoring sprint progress, and ensuring proper Agile methodology application.
    
    \item \textbf{Development Team – Nour Souayah}: Responsible for system analysis, backend and frontend development, database modeling, API integration, testing, intelligent assistant integration, and deployment preparation.
\end{itemize}

The Scrum organization follows these parameters:

\begin{itemize}
    \item Sprint Duration: Two-week sprints
    \item Daily Standup: 15-minute synchronization meetings (12:30 PM local time suggested)
    \item Incremental Delivery: Functional modules delivered progressively
\end{itemize}

\subsection{Product Backlog (MoSCoW Prioritization)}

The product backlog is organized using the MoSCoW prioritization method:

\begin{itemize}
    \item \textbf{Must Have (M)}
    \item \textbf{Should Have (S)}
    \item \textbf{Could Have (C)}
    \item \textbf{Won’t Have (W)}
\end{itemize}

\begin{longtable}{|c|p{2.4cm}|c|c|p{6.0cm}|c|c|}
\hline
	extbf{Epic} & \textbf{Module} & \textbf{ID} & \textbf{Sprint} & \textbf{User Story} & \textbf{Priority} & \textbf{Points} \\
\hline
1 & Authentication & 1.1 & 1 & As a Visitor, I want to register using my personal information and credentials so that I can create an account and request access. & M & 5 \\
\hline
1 & Authentication & 1.2 & 1 & As a Registered User, I want to securely log in using email and password so that I can access my workspace and data. & M & 5 \\
\hline
1 & Authentication & 1.3 & 1 & As a Pending User, I want to wait for administrator approval before accessing operational modules so that only verified users can perform sensitive actions. & M & 3 \\
\hline
2 & User Management & 2.1 & 2 & As an Administrator, I want to create user accounts and assign roles so that the correct permissions are granted to each person. & M & 5 \\
\hline
2 & User Management & 2.2 & 2 & As an Administrator, I want to update or deactivate user accounts so that I can maintain an accurate and secure user base. & M & 4 \\
\hline
2 & User Management & 2.3 & 2 & As an Administrator, I want to validate pending users so that only authorized personnel gain access to the system. & M & 4 \\
\hline
3 & Warehouse Management & 3.1 & 3 & As an Administrator, I want to create warehouses with descriptions and surface metadata so that physical locations are modeled accurately. & M & 5 \\
\hline
3 & Warehouse Management & 3.2 & 3 & As an Administrator, I want to configure warehouse blocs with capacities so that storage constraints are enforced. & M & 5 \\
\hline
3 & Warehouse Management & 3.3 & 3 & As a Manager, I want to visualize warehouse inventory levels in real time so that I can make informed operational decisions. & M & 5 \\
\hline
4 & Product Management & 4.1 & 3 & As an Administrator, I want to create products with prices and quantities so that the catalog reflects available stock and pricing. & M & 5 \\
\hline
4 & Product Management & 4.2 & 3 & As an Administrator, I want to assign products to storage blocs so that product locations are tracked. & M & 5 \\
\hline
4 & Product Management & 4.3 & 3 & As a Technician, I want to move products between blocs so that physical stock movements are recorded. & M & 5 \\
\hline
4 & Product Management & 4.4 & 3 & As a Technician, I want to update inventory quantities after stock operations so that the system reflects true stock levels. & M & 4 \\
\hline
5 & Order Management & 5.1 & 4 & As a Customer, I want to browse available products so that I can choose items to order. & M & 5 \\
\hline
5 & Order Management & 5.2 & 4 & As a Customer, I want to place orders containing multiple products so that I can purchase several items in one transaction. & M & 8 \\
\hline
5 & Order Management & 5.3 & 4 & As a Manager, I want to approve or reject customer orders so that only feasible orders are fulfilled. & M & 6 \\
\hline
5 & Order Management & 5.4 & 4 & As a Manager, I want to request restocking when stock is insufficient so that orders can be satisfied later. & M & 5 \\
\hline
6 & Shipment Management & 6.1 & 4 & As a Manager, I want to create shipments for restocking operations so that inventory can be replenished. & M & 5 \\
\hline
6 & Shipment Management & 6.2 & 4 & As a Manager, I want to update shipment states during delivery workflows so that the supply chain status is traceable. & M & 5 \\
\hline
6 & Shipment Management & 6.3 & 4 & As a Customer, I want to track shipment and delivery status so that I know when to expect my order. & M & 5 \\
\hline
7 & Support Ticket Management & 7.1 & 3 & As a Technician, I want to create support tickets for operational issues so that problems are tracked and resolved. & M & 4 \\
\hline
7 & Support Ticket Management & 7.2 & 3 & As an Administrator, I want to manage and resolve support tickets so that operational issues are closed with appropriate actions. & M & 5 \\
\hline
8 & Intelligent Assistant & 8.1 & 7 & As a Manager, I want to ask the chatbot about warehouse stock and bloc information using natural language so that I can get quick operational answers. & S & 6 \\
\hline
8 & Intelligent Assistant & 8.2 & 7 & As an Administrator, I want to interact with the intelligent assistant to retrieve inventory information so that I can make governance decisions faster. & S & 6 \\
\hline
8 & Intelligent Assistant & 8.3 & 7 & As a Manager, I want to ask which products are low on stock or where products are stored so that I can trigger restock workflows proactively. & S & 5 \\
\hline
9 & Predictive Analytics & 9.1 & 6 & As a Manager, I want to visualize predictive inventory analytics and stock forecasting so that I can plan procurement and avoid stockouts. & S & 8 \\
\hline
9 & Predictive Analytics & 9.2 & 6 & As a Manager, I want to analyze inventory trends using AI-generated insights so that I can optimize ordering and storage decisions. & S & 6 \\
\hline
10 & User Profile Management & 10.1 & 1 & As a User, I want to view and update my profile information so that my account details remain current. & M & 3 \\
\hline
10 & User Profile Management & 10.2 & 1 & As a User, I want to upload a profile picture so that my account is personalized. & M & 2 \\
\hline
\caption{Product Backlog with Detailed User Stories}
\label{tab:product_backlog}
\end{longtable}

\section{Project Sprint Organization}

The project development is organized into a sequence of sprints that incrementally deliver value. The following sprint plan replaces the previous schedule and matches the requested roadmap.

\subsection{Sprint 0: Specification and Planning}

Goals:
\begin{itemize}
    \item Complete system analysis and high-level architecture design.
    \item Produce technical specifications, initial Prisma schema, and deployment notes.
    \item Prepare backlog, acceptance criteria, and demo plan.
\end{itemize}

\subsection{Sprint 1: Authentication and Access Control}

Goals:
\begin{itemize}
    \item Implement secure authentication (JWT) and access token lifecycle.
    \item Provide user profile interfaces in the frontend (register/login/pending/profile).
\end{itemize}

\subsection{Sprint 2: User Management and Role Workflows}

Goals:
\begin{itemize}
    \item Implement admin user management module (create/update/deactivate).
    \item Integrate role-based workflows and server-side guards.
\end{itemize}

\subsection{Sprint 3: Inventory Management and Product Modules}

Goals:
\begin{itemize}
    \item Implement product catalog, bloc assignment and inventory operations.
    \item Enforce capacity constraints and transactional updates for stock movement.
\end{itemize}

\subsection{Sprint 4: Order Management and Shipment Tracking}

Goals:
\begin{itemize}
    \item Implement multi-item order model and manager approval workflow.
    \item Implement shipment lifecycle (requested → in-transit → received) with traceability.
\end{itemize}

\subsection{Sprint 5: Data Collection, Structuring and Organization}

Goals:
\begin{itemize}
    \item Instrument operational events and produce ETL-ready datasets.
    \item Implement exports and sample datasets for analytics (CSV/JSON).
\end{itemize}

\subsection{Sprint 6: Predictive Analytics for Demand Forecasting}

Goals:
\begin{itemize}
    \item Develop baseline predictive models for inventory forecasting (CRISP-DM phases).
    \item Validate models with sample datasets and provide evaluation metrics.
\end{itemize}

\subsection{Sprint 7: Business Intelligence Dashboards and AI Assistant}

Goals:
\begin{itemize}
    \item Implement business intelligence dashboards for operational KPIs.
    \item Integrate the AI assistant (read-only queries then ticket creation flow) and dashboard visualizations.
\end{itemize}

\section{Project Releases}

To align product milestones with PFE deliverables, the project is organized into three releases mapping the above sprints:

\begin{itemize}
    \item \textbf{Release 1 — Foundation (Sprints 1–2)}: Authentication, onboarding, and user management with RBAC (system analysis completed in Sprint 0).
    \item \textbf{Release 2 — Core Operations (Sprints 3–4)}: Inventory, product catalog, multi-item orders, and shipment workflows enabling end-to-end fulfillment.
    \item \textbf{Release 3 — Analytics & Intelligence (Sprints 5–7)}: Data collection/ETL, predictive analytics, BI dashboards, and AI assistant integration for operational insights.
\end{itemize}

\section{Gantt Diagram}

The following Gantt diagram illustrates the global planning and sprint organization of the project.

\begin{figure}[H]
\centering
\includegraphics[width=1\textwidth]{chapters/assets/Diagramme-de-Gantt.png}
\caption{Project Gantt Diagram}
\label{fig:gantt}
\end{figure}

\section{CRISP-DM Methodology for Predictive Analytics}

To develop the predictive inventory module, the CRISP-DM methodology is adopted.

The methodology includes the following phases:

\begin{itemize}
    \item Business Understanding
    \item Data Understanding
    \item Data Preparation
    \item Modeling
    \item Evaluation
    \item Deployment
\end{itemize}



\section{Technical Architecture}

\subsection{Three-Tier Architecture}

The platform follows a logical three-tier architecture:

\begin{itemize}
    \item Presentation Layer
    \item Business Logic Layer
    \item Data Layer
\end{itemize}

\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{chapters/assets/three_tier_architecture.png}
\caption{Three-Tier Architecture}
\label{fig:three_tier}
\end{figure}

\subsection{MVC Architecture}

The backend follows the MVC architectural pattern implemented using NestJS.

\begin{itemize}
    \item Controllers handle HTTP requests
    \item Services implement business logic
    \item Prisma ORM manages database communication
\end{itemize}

\subsection{Backend Architecture}

The backend architecture contains the following modules:

\begin{itemize}
    \item Auth Module
    \item User Module
    \item Admin Module
    \item Warehouse Module
    \item Bloc Module
    \item Product Module
    \item Order Module
    \item Shipment Module
    \item Support Ticket Module
\end{itemize}

\subsection{Frontend Architecture}

The frontend is developed using Next.js App Router with role-based workspaces.

Each role has a dedicated workspace:

\begin{itemize}
    \item /admin
    \item /manager
    \item /technicien
    \item /customer
    \item /pending
\end{itemize}

\section{Conclusion}

This chapter presented the requirement analysis, Scrum organization, sprint planning, product backlog, release organization, AI methodology integration, and technical architecture of the Intelligent Inventory Management Platform.

The analysis phase established the functional and technical foundations required for implementing the platform.

The next chapter presents Release 1 implementation, including authentication, role management, warehouse configuration, and product management functionalities.

________________________________________________________________

\chapter{Release 1 : Foundation and Access Control}
\label{chap3}

\newpage

\section{Introduction}

This chapter details Release 1 (Foundation and Access Control), which implements authentication, onboarding and user management features forming the baseline of the platform. It summarises sprint objectives, sprint backlogs, design diagrams and the review/retrospective outcomes for Sprint 1 and Sprint 2.

\section{Sprint 1 : Authentication and Onboarding}

\subsection{Sprint 1 Objective}

The primary objective of Sprint 1 was to implement secure user authentication and onboarding flows enabling registration, login, pending-user approval, and basic user profile management. Key acceptance criteria:
\begin{itemize}
    \item Secure registration with data validation
    \item Password hashing and secure storage
    \item JWT-based authentication and token lifecycle
    \item Pending user workflow for administrator approval
    \item Basic profile view and update
\end{itemize}

\subsection{Sprint 1 Backlog}

Table \ref{tab:sprint1_backlog} presents the user stories selected for Sprint 1.

\begin{table}[H]
\centering
\caption{Sprint 1 Backlog}
\label{tab:sprint1_backlog}
\begin{tabular}{|c|p{8cm}|c|c|}
\hline
\textbf{ID} & \textbf{User Story} & \textbf{Priority} & \textbf{Points} \\
\hline
US1.1 & As a Visitor, I want to register using my personal information so that I can request access to the platform. & M & 5 \\
\hline
US1.2 & As a Registered User, I want to log in securely using my email and password so that I can access my workspace. & M & 5 \\
\hline
US1.3 & As a Pending User, I want my account to remain restricted until administrator approval. & M & 3 \\
\hline
US1.4 & As a User, I want to view and update my profile information. & M & 3 \\
\hline
US1.5 & As a User, I want to upload a profile picture to personalize my account. & M & 2 \\
\hline
\end{tabular}
\end{table}

\subsection{Sprint 1 Use Case Diagram}

Figure~\ref{fig:sprint1_usecase} summarises the main actors and interactions for Sprint 1 (Registration, Login, Pending Approval, Profile management).
\begin{figure}[H]
\centering
\includegraphics[width=0.85\textwidth]{chapters/assets/sprint1_usecase.png}
\caption{Sprint 1 Use Case Diagram}
\label{fig:sprint1_usecase}
\end{figure}

\subsection{Sprint 1 Sequence Diagram}

The sequence diagram in Figure~\ref{fig:sprint1_sequence} shows the principal message flow for a new user registration and the pending approval process.
\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{chapters/assets/sprint1_sequence.png}
\caption{Sprint 1 Sequence Diagram}
\label{fig:sprint1_sequence}
\end{figure}

\subsection{Sprint 1 Review}

During the Sprint 1 review the team demonstrated the following completed items:
\begin{itemize}
    \item Registration and login endpoints with validation and error handling
    \item JWT authentication integrated into protected API routes
    \item Administrator pending-user approval UI and flow
    \item Profile read/update UI and avatar upload
\end{itemize}

\subsection{Sprint 1 Retrospective}

Key takeaways and action items from Sprint 1 retrospective:
\begin{itemize}
    \item Improve validation error messages for a better UX
    \item Add end-to-end tests for the authentication flows
    \item Harden token expiration and refresh handling
    \item Document onboarding steps for administrators
\end{itemize}

\section{Sprint 2 : User Management and Role-Based Access Control}

\subsection{Sprint 2 Objective}

Sprint 2 focuses on implementing the administrator user management module and role-based access control (RBAC) across the backend and frontend, enabling administrators to create, update, deactivate users and assign roles securely.

\subsection{Sprint 2 Backlog}

Table \ref{tab:sprint2_backlog} presents the user stories implemented during Sprint 2.

\begin{table}[H]
\centering
\caption{Sprint 2 Backlog}
\label{tab:sprint2_backlog}
\begin{tabular}{|c|p{8cm}|c|c|}
\hline
\textbf{ID} & \textbf{User Story} & \textbf{Priority} & \textbf{Points} \\
\hline
US2.1 & As an Administrator, I want to create user accounts and assign roles so that permissions are managed correctly. & M & 5 \\
\hline
US2.2 & As an Administrator, I want to update or deactivate user accounts so that I can maintain system security. & M & 4 \\
\hline
US2.3 & As an Administrator, I want to validate pending users before granting access to the platform. & M & 4 \\
\hline
US2.4 & As an Administrator, I want to assign and modify user roles so that each actor accesses only authorized functionalities. & M & 5 \\
\hline
US2.5 & As the System, I want to enforce role-based access control on protected routes and APIs. & M & 5 \\
\hline
\end{tabular}
\end{table}

\subsection{Sprint 2 Use Case Diagram}

Figure~\ref{fig:sprint2_usecase} presents the use cases related to user lifecycle management and role assignment.
\begin{figure}[H]
\centering
\includegraphics[width=0.85\textwidth]{chapters/assets/sprint2_usecase.png}
\caption{Sprint 2 Use Case Diagram}
\label{fig:sprint2_usecase}
\end{figure}

\subsection{Sprint 2 Sequence Diagram}

Figure~\ref{fig:sprint2_sequence} shows the sequence of messages when an administrator creates a user, assigns a role, and the user receives access.
\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{chapters/assets/sprint2_sequence.png}
\caption{Sprint 2 Sequence Diagram}
\label{fig:sprint2_sequence}
\end{figure}

\subsection{Sprint 2 Review}

Completed items shown in the Sprint 2 review:
\begin{itemize}
    \item Admin UI: Create / Edit / Deactivate users
    \item Server-side guards: Role-based route protection
    \item Role assignment CRUD and validation
    \item Audit logging for user lifecycle events
\end{itemize}

\subsection{Sprint 2 Retrospective}

Retrospective highlights and improvements:
\begin{itemize}
    \item Add role-based integration tests for critical endpoints
    \item Improve audit log retention and export capabilities
    \item Streamline admin UX for bulk user operations
\end{itemize}

\section{Release 1 Class Diagram}

The Release 1 class diagram (Figure~\ref{fig:release1_class}) illustrates the core domain entities implemented in this release: `User`, `Role`, `PendingUser`, `Profile`, and `AuthToken` services and their relationships.
\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{chapters/assets/release1_class_diagram.png}
\caption{Release 1 Class Diagram}
\label{fig:release1_class}
\end{figure}

\section{Release 1 Database Model}

The database model for Release 1 contains the following tables/entities (Prisma schema excerpts can be found in the repository):
\begin{itemize}
    \item `User` — stores user identity, email, hashed password, status and profile reference
    \item `Role` — enumerates roles (Administrator, Manager, Technician, Customer, Pending)
    \item `PendingUser` — temporary records for registration awaiting approval
    \item `Profile` — stores display name, avatar path and contact metadata
    \item `AuthToken` or token metadata table (optional) — stores refresh tokens and revocation state
\end{itemize}

An example Prisma model (excerpt) used in Release 1 is documented in the repository under `prisma/schema.prisma`.

\section{Release 1 User Interfaces}

This section summarises the primary user interfaces delivered in Release 1:
\begin{itemize}
    \item Registration page (public)
    \item Login page (public)
    \item Pending users dashboard (admin)
    \item User management dashboard (admin)
    \item Profile settings (authenticated users)
\end{itemize}

Screenshots and frontend route references are available in the frontend app under the `app` and `src` folders.

\section{Conclusion}

Release 1 established the foundational security and access control primitives required for the platform. It delivered robust authentication, onboarding, and administration features that enable the subsequent implementation of inventory, order and shipment modules in Release 2.


_________________________________________________________________

% -------------------------
% Chapter 4: Release 2
% -------------------------
\chapter{Release 2 : Core Operations}
\label{chap4}

\newpage

% 4.1 Introduction
\section{Introduction}

Release 2 delivers the core operational features required for end-to-end order fulfillment: inventory management, product catalog, order lifecycle and shipment tracking. It builds on the authentication and RBAC primitives delivered in Release 1 and focuses on transactional integrity, capacity enforcement and operational UX for managers and technicians.

% 4.2 Sprint 3
\section{Sprint 3: Inventory Management and Product Modules}

\subsection{4.2.1 Sprint 3 Objective}

Model physical storage (warehouses and blocs), implement the product catalog and enforce capacity and transactional integrity when moving or updating stock.

\subsection{4.2.2 Sprint 3 Backlog}

Table \ref{tab:sprint3_backlog} lists the user stories selected for Sprint 3 (US3.x).

\begin{table}[H]
\centering
\caption{Sprint 3 Backlog}
\label{tab:sprint3_backlog}
\begin{tabular}{|c|p{8cm}|c|c|}
\hline
	extbf{ID} & \textbf{User Story} & \textbf{Priority} & \textbf{Points} \\
\hline
US3.1 & As an Administrator, I want to create warehouses with metadata so that physical locations are modeled accurately. & M & 5 \\
\hline
US3.2 & As an Administrator, I want to configure blocs with capacities so that storage constraints are enforced. & M & 5 \\
\hline
US3.3 & As a Manager, I want to visualize warehouse inventory levels in real time so that I can make operational decisions. & M & 5 \\
\hline
US3.4 & As an Administrator, I want to create products with prices and quantities so that the catalog reflects available stock. & M & 5 \\
\hline
US3.5 & As an Administrator, I want to assign products to storage blocs so that product locations are tracked. & M & 5 \\
\hline
US3.6 & As a Technician, I want to move products between blocs so that physical stock movements are recorded. & M & 5 \\
\hline
US3.7 & As a Technician, I want to update inventory quantities after stock operations so that the system reflects true stock levels. & M & 4 \\
\hline
US3.8 & As a Technician, I want to create support tickets for operational issues so that problems are tracked. & M & 4 \\
\hline
US3.9 & As an Administrator, I want to manage and resolve support tickets so that operational issues are closed. & M & 5 \\
\hline
\end{tabular}
\end{table}

\subsection{4.2.3 Sprint 3 Use Case Diagram}

See the use case diagram in \texttt{chapters/assets/sprint3_usecase.png} illustrating interactions between Administrator, Manager, Technician and Product/Bloc operations.

\subsection{4.2.4 Sprint 3 Sequence Diagram}

See \texttt{chapters/assets/sprint3_sequence_move_product.png} for the product assignment and stock movement sequence (technician flow).

\subsection{4.2.5 Sprint 3 Review}

Completed items and demonstrations:
\begin{itemize}
    \item Product catalog CRUD with bloc assignment.
    \item Bloc capacity validation and \texttt{InventoryMovement} event logging.
    \item Technician flows to move products between blocs with transactional guarantees.
    \item Warehouse dashboard with bloc usage indicators.
\end{itemize}

\subsection{4.2.6 Sprint 3 Retrospective}

Improvements and action items:
\begin{itemize}
    \item Improve error messaging for capacity constraint failures.
    \item Add integration tests for concurrent moves/receives.
    \item Enhance technician UI for batch moves and quick adjustments.
\end{itemize}

% 4.3 Sprint 4
\section{Sprint 4: Order Management and Shipment Tracking}

\subsection{4.3.1 Sprint 4 Objective}

Implement multi-item orders, manager approval/rejection workflows that adjust stock atomically on approval, and shipment lifecycle (requested → in-transit → received) with receive-time capacity validation.

\subsection{4.3.2 Sprint 4 Backlog}

Table \ref{tab:sprint4_backlog} lists the user stories selected for Sprint 4 (US4.x / US5.x / US6.x).

\begin{table}[H]
\centering
\caption{Sprint 4 Backlog}
\label{tab:sprint4_backlog}
\begin{tabular}{|c|p{8cm}|c|c|}
\hline
	extbf{ID} & \textbf{User Story} & \textbf{Priority} & \textbf{Points} \\
\hline
US4.1 & As a Customer, I want to browse available products so that I can choose items to order. & M & 5 \\
\hline
US4.2 & As a Customer, I want to place orders containing multiple products so that I can purchase several items in one transaction. & M & 8 \\
\hline
US4.3 & As a Manager, I want to approve or reject customer orders so that only feasible orders are fulfilled. & M & 6 \\
\hline
US4.4 & As a Manager, I want to request restocking when stock is insufficient so that orders can be satisfied later. & M & 5 \\
\hline
US4.5 & As a Manager, I want to create shipments for restocking operations so that inventory can be replenished. & M & 5 \\
\hline
US4.6 & As a Manager, I want to update shipment states during delivery workflows so that the supply chain status is traceable. & M & 5 \\
\hline
US4.7 & As a Customer, I want to track shipment and delivery status so that I know when to expect my order. & M & 5 \\
\hline
\end{tabular}
\end{table}

\subsection{4.3.3 Sprint 4 Use Case Diagram}

See \texttt{chapters/assets/sprint4_usecase.png} for the order-to-shipment actors and flows.

\subsection{4.3.4 Sprint 4 Sequence Diagram}

See \texttt{chapters/assets/sprint4_sequence_order_create.png} for the sequence (customer places order → manager review/approve → shipment creation).

\subsection{4.3.5 Sprint 4 Review}

Completed demonstrations:
\begin{itemize}
    \item Multi-item order creation and validation flows.
    \item Manager order review panel with approve/reject actions.
    \item Shipment creation and transit/receive workflows with capacity checks.
\end{itemize}

\subsection{4.3.6 Sprint 4 Retrospective}

Lessons learned and improvements:
\begin{itemize}
    \item Improve UX for partial fulfillment and backorder handling.
    \item Add clearer notifications for customers and managers on order/shipments.
    \item Harden transactional tests for approval/stock decrement operations.
\end{itemize}

% 4.4 Release 2 Class Diagram
\section{Release 2 Class Diagram}

Entities added or extended in Release 2: \texttt{Product}, \texttt{Warehouse}, \texttt{Bloc}, \texttt{Order}, \texttt{OrderItem}, \texttt{Shipment}, \texttt{RestockRequest}. See \texttt{chapters/assets/release2_class_diagram.png} for relationships and service boundaries.

% 4.5 Release 2 Database Model
\section{Release 2 Database Model}

Prisma schema excerpts for entities introduced/extended in Release 2 (full schema in \texttt{warehouse-backend/prisma/schema.prisma}):

\begin{verbatim}
model Warehouse {
    id        Int      @id @default(autoincrement())
    name      String
    description String?
    surface   Float?
    blocs     Bloc[]
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Bloc {
    id          Int      @id @default(autoincrement())
    name        String
    capacity    Int
    currentUsage Int     @default(0)
    warehouse   Warehouse @relation(fields: [warehouseId], references: [id])
    warehouseId Int
    products    Product[]
}

model Product {
    id        Int      @id @default(autoincrement())
    name      String
    description String?
    price     Float
    quantity  Int
    bloc      Bloc?    @relation(fields: [blocId], references: [id])
    blocId    Int?
}

model Order {
    id          Int       @id @default(autoincrement())
    customerId  Int
    items       OrderItem[]
    totalAmount Float
    status      OrderStatus @default(REQUESTED)
    createdAt   DateTime @default(now())
}

model OrderItem {
    id        Int    @id @default(autoincrement())
    order     Order  @relation(fields: [orderId], references: [id])
    orderId   Int
    productId Int
    productName String
    unitPrice Float
    quantity  Int
    lineTotal Float
}

model Shipment {
    id         Int     @id @default(autoincrement())
    orderId    Int?
    productName String
    quantity   Int
    blocId     Int
    status     ShipmentStatus @default(REQUESTED)
    expectedAt DateTime?
    receivedAt DateTime?
}
\end{verbatim}

% 4.6 Release 2 User Interfaces
\section{Release 2 User Interfaces}

Key screens delivered:
\begin{itemize}
    \item Warehouse dashboard: list & detail with bloc map and capacity indicators.
    \item Bloc detail: product list, current usage gauge, move product controls.
    \item Product catalog: create/edit product modal with bloc assignment.
    \item Order creation and checkout flows (customer).
    \item Manager order review panel and shipment management console.
\end{itemize}

% 4.7 Conclusion
\section{Conclusion}

Release 2 implemented the core operational capabilities enabling end-to-end fulfillment while maintaining strong transactional guarantees around stock and capacity. The next release (Release 3) will focus on instrumenting events, ETL pipelines, predictive analytics and integrating the AI assistant for operational insights.

% End of Chapter 4

___________________________________________________________________

