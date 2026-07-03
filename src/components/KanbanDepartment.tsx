import React, { useState } from "react";
import { DollarSign, Search, Plus, UserPlus, HelpCircle, ChevronDown, Flag, Phone, Settings, MoreHorizontal, ChevronRight, Activity, Circle, Target, Users, BookOpen, UserCheck, CheckCircle2, MoreVertical, SearchIcon, Filter, Layers, Clock } from "lucide-react";
import { Ticket } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Stage {
  id: string;
  title: string;
  color: string;
}

interface KanbanDepartmentProps {
  title: string;
  subtitle: string;
  departmentKey: string;
  stages: Stage[];
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  onTicketClick: (ticket: Ticket) => void;
  onEduCareClick?: () => void;
  onAddNewItem?: () => void;
  onViewChange?: (view: string) => void;
  onFilterClick?: () => void;
}

interface ItemFormat {
  id: string;
  title: string;
  org: string;
  val: string;
  valNum: number;
  stage: string;
  color: string;
  warning?: boolean;
  active?: boolean;
  won?: boolean;
  ticketData: Ticket;
}

export default function KanbanDepartment({ 
  title, 
  subtitle, 
  departmentKey, 
  stages, 
  tickets, 
  setTickets,
  onTicketClick,
  onEduCareClick,
  onAddNewItem,
  onViewChange,
  onFilterClick
}: KanbanDepartmentProps) {
  const [isFiltering, setIsFiltering] = useState(false);
  // Data-driven mapping identically to Sales Department
  const departmentTickets = tickets.filter(t => t.status === departmentKey);

  const items: ItemFormat[] = departmentTickets.map((t) => {
    const valNum = Number(t.addressDetails?.mortgageRequired || 0);
    return {
      id: t.id,
      title: t.clientInfo.name || "Unknown Client",
      org: t.employmentDetails?.company || t.addressDetails?.street || "New Folder",
      val: valNum > 0 ? `${valNum.toLocaleString('fr-FR')}€` : "—",
      valNum,
      stage: t.subStatus || stages[0]?.id || "New",
      color: "bg-slate-300",
      warning: (t.ticketStatus === "Review"),
      active: (t.ticketStatus === "In Progress"),
      won: (t.ticketStatus === "Completed"),
      ticketData: t
    };
  });

  const totalCount = items.length;
  const totalValue = items.reduce((acc, item) => acc + item.valNum, 0);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    setTickets(prev => prev.map(t => t.id === draggableId ? { ...t, subStatus: destination.droppableId } : t));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fafc] dark:bg-slate-900 w-full overflow-hidden text-[12px]">
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-[16px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {title}
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{departmentKey}</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          
          <button 
            onClick={onAddNewItem}
            className={`ml-6 px-4 py-1.5 ${departmentKey === "Quality Assurance" ? "bg-rose-600 hover:bg-rose-700" : "bg-green-600 hover:bg-green-700"} text-white font-medium rounded flex items-center gap-1 transition-colors`}>
            <Plus className="w-4 h-4" /> {departmentKey === "Quality Assurance" ? "Live Monitoring" : "New Item"}
          </button>
          
          {departmentKey === "Client Experience" && (
            <button 
              onClick={onEduCareClick}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded flex items-center gap-1 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Edu-Care Module
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
           {totalValue > 0 && <span className="font-semibold text-black dark:text-white">{totalValue.toLocaleString('fr-FR')}€</span>}
           {totalValue > 0 && <span className="text-slate-500 dark:text-slate-400">•</span>}
           <span className="font-semibold text-black dark:text-white">{totalCount} items</span>
        </div>
           
        <div className="flex items-center gap-1 ml-4 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800">
          <button 
            onClick={() => onViewChange?.("Board")}
            className="px-3 py-1.5 flex items-center gap-2 border-r border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
            <Layers className="w-4 h-4" />
            Board View
            <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
          </button>
          <button onClick={() => {
            setIsFiltering(!isFiltering);
          }} className={`px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 ${isFiltering ? "bg-slate-100" : ""}`}>
            <Filter className={`w-4 h-4 ${isFiltering ? "text-rose-600" : ""}`} />
          </button>
        </div>
      </div>
      
      {isFiltering && (
        <div className="px-6 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[12px] flex items-center gap-4">
          <span className="font-medium text-slate-500">Filter by:</span>
          <select className="border border-slate-300 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900">
            <option>All Items</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Completed</option>
          </select>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-2 dark:bg-slate-950 flex pb-4">
          {stages.map((stage) => {
            const stageItems = items.filter(t => t.stage === stage.id || (!departmentTickets.find(dt => dt.id === t.id)?.subStatus && stage.id === stages[0]?.id));
            const stageValue = stageItems.reduce((acc, item) => acc + item.valNum, 0);

            return (
              <div key={stage.id} className="min-w-[280px] w-[280px] flex-shrink-0 flex flex-col bg-slate-100 dark:bg-slate-900 mx-1 rounded border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group h-full">
                 <div className="bg-white dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700 relative z-10">
                   <div className="flex items-center justify-between mb-1">
                     <h4 className="font-semibold text-[13px] text-slate-800 dark:text-white truncate">{stage.title}</h4>
                   </div>
                   <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex justify-between">
                     <span>{stageItems.length} items</span>
                     {stageValue > 0 && <span>{stageValue.toLocaleString('fr-FR')}€</span>}
                   </div>
                   <div className={`absolute top-0 left-0 w-full h-1 ${stage.color}`}></div>
                 </div>

                 <Droppable droppableId={stage.id}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="p-2 space-y-2 flex-1 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-900/50"
                      >
                        {stageItems.map((item, index) => (
                          <React.Fragment key={item.id}>
                          <Draggable draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onTicketClick(item.ticketData)}
                                className={`bg-white dark:bg-slate-800 rounded border shadow-sm cursor-pointer hover:shadow-md transition-all overflow-hidden relative ${snapshot.isDragging ? 'border-blue-500 ring-2 ring-blue-500/20 z-50 shadow-xl' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'} ${item.won ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : ''}`}
                              >
                                <div className={`absolute top-0 left-0 bottom-0 w-1 ${stage.color}`}></div>
                                
                                <div className="p-3 pl-4">
                                  <div className="flex items-start justify-between">
                                    <div className="font-semibold text-slate-800 dark:text-white leading-tight pr-4">{item.title}</div>
                                    <div className="shrink-0 flex gap-1">
                                      {item.warning && <div className="text-yellow-500"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.83L19.5 19H4.5L12 5.83zM11 10h2v5h-2v-5zm0 6h2v2h-2v-2z"/></svg></div>}
                                      {item.active && <div className=" bg-green-500 rounded-full w-4 h-4 flex items-center justify-center pr-px"><ChevronRight className="w-3 h-3 text-white" /></div>}
                                    </div>
                                  </div>
                                  
                                  <div className="text-slate-500 text-[11px] mt-1 pr-6 truncate">{item.id} • {item.org}</div>
                                  
                                  <div className="mt-3 flex justify-between items-center text-[12px]">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-400">
                                       <Clock className="w-3 h-3" />
                                       {new Date().toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                                       {item.won && <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold mr-1">DONE</span>}
                                       {item.val !== "—" && item.val}
                                       <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[8px] font-bold text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ml-1">
                                         {item.title.charAt(0)}
                                       </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                          </React.Fragment>
                        ))}
                        {provided.placeholder}
                        <div className="pt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium flex items-center justify-center w-full gap-1 p-1">
                             <Plus className="w-3 h-3" /> Add item
                           </button>
                        </div>
                      </div>
                    )}
                 </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
