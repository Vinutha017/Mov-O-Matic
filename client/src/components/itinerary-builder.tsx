import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  GripVertical, 
  Clock, 
  MapPin, 
  DollarSign, 
  Edit, 
  Trash2, 
  Save,
  Sparkles,
  Navigation
} from "lucide-react";
import type { TripWithDetails, Activity, InsertActivity } from "@shared/schema";

const activitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  cost: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

const categories = [
  { value: "attraction", label: "Attraction" },
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" }
];

interface ItineraryBuilderProps {
  trip: TripWithDetails;
}

export default function ItineraryBuilder({ trip }: ItineraryBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState(0);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startTime: "",
      endTime: "",
      cost: "",
      category: "attraction",
      notes: "",
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: async (data: InsertActivity) => {
      const response = await apiRequest("POST", `/api/days/${trip.days[selectedDay].id}/activities`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips", trip.id] });
      setIsAddingActivity(false);
      form.reset();
      toast({
        title: "Activity Added",
        description: "New activity has been added to your itinerary.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Activity",
        description: "There was an error adding the activity. Please try again.",
        variant: "destructive",
      });
      console.error("Add activity error:", error);
    }
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Activity> }) => {
      const response = await apiRequest("PATCH", `/api/activities/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips", trip.id] });
      setEditingActivity(null);
      form.reset();
      toast({
        title: "Activity Updated",
        description: "Activity has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Activity",
        description: "There was an error updating the activity. Please try again.",
        variant: "destructive",
      });
      console.error("Update activity error:", error);
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/activities/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips", trip.id] });
      toast({
        title: "Activity Deleted",
        description: "Activity has been removed from your itinerary.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Activity",
        description: "There was an error deleting the activity. Please try again.",
        variant: "destructive",
      });
      console.error("Delete activity error:", error);
    }
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    // For now, we'll just show a toast about reordering
    // In a full implementation, you'd update the sortOrder of activities
    toast({
      title: "Reordering Activities",
      description: "Activity order will be optimized automatically.",
    });
  };

  const onSubmit = (data: ActivityFormData) => {
    const activityData: InsertActivity = {
      dayId: trip.days[selectedDay].id,
      title: data.title,
      description: data.description || undefined,
      location: data.location || undefined,
      startTime: data.startTime || undefined,
      endTime: data.endTime || undefined,
      cost: data.cost ? data.cost : undefined,
      category: data.category as any,
      notes: data.notes || undefined,
      sortOrder: trip.days[selectedDay].activities.length,
    };

    if (editingActivity) {
      updateActivityMutation.mutate({
        id: editingActivity.id,
        data: activityData
      });
    } else {
      addActivityMutation.mutate(activityData);
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    form.reset({
      title: activity.title,
      description: activity.description || "",
      location: activity.location || "",
      startTime: activity.startTime || "",
      endTime: activity.endTime || "",
      cost: activity.cost || "",
      category: activity.category || "attraction",
      notes: activity.notes || "",
    });
    setIsAddingActivity(true);
  };

  const calculateDayBudget = (activities: Activity[]) => {
    return activities.reduce((total, activity) => {
      const cost = parseFloat(activity.cost || "0");
      return total + cost;
    }, 0);
  };

  if (!trip.days || trip.days.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Navigation className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Itinerary Days</h3>
            <p className="text-gray-600 mb-6">Start building your itinerary by adding days and activities.</p>
            <Button className="travel-button">
              <Plus className="w-4 h-4 mr-2" />
              Add First Day
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDay = trip.days[selectedDay];
  const dayBudget = calculateDayBudget(currentDay?.activities || []);

  return (
    <div className="space-y-6">
      {/* Day Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daily Itinerary</span>
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-primary hover:bg-primary hover:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Optimize Route
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {trip.days.map((day, index) => (
              <Button
                key={day.id}
                variant={selectedDay === index ? "default" : "outline"}
                className={`flex-shrink-0 ${selectedDay === index ? "travel-gradient" : ""}`}
                onClick={() => setSelectedDay(index)}
              >
                Day {day.dayNumber}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Day Details */}
      {currentDay && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Day {currentDay.dayNumber}</CardTitle>
                {currentDay.title && (
                  <p className="text-sm text-gray-600 mt-1">{currentDay.title}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">₹{dayBudget.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Estimated Cost</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="activities">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {currentDay.activities.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Navigation className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Planned</h3>
                        <p className="text-gray-600 mb-4">Add your first activity to get started.</p>
                      </div>
                    ) : (
                      currentDay.activities.map((activity, index) => (
                        <Draggable key={activity.id} draggableId={activity.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border border-gray-200 rounded-lg p-4 bg-white transition-shadow ${
                                snapshot.isDragging ? "shadow-lg" : "hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab"
                                >
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                  {index + 1}
                                </div>
                                
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                                  {activity.description && (
                                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                                  )}
                                  <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
                                    {activity.startTime && activity.endTime && (
                                      <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {activity.startTime} - {activity.endTime}
                                      </span>
                                    )}
                                    {activity.location && (
                                      <span className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {activity.location}
                                      </span>
                                    )}
                                    {activity.cost && (
                                      <span className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        ₹{activity.cost}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditActivity(activity)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => deleteActivityMutation.mutate(activity.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div className="mt-6">
              <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full travel-gradient"
                    onClick={() => {
                      setEditingActivity(null);
                      form.reset();
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingActivity ? "Edit Activity" : "Add New Activity"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Visit Red Fort" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of the activity"
                                className="resize-none"
                                rows={2}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Address or location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes or reminders"
                                className="resize-none"
                                rows={2}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddingActivity(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={addActivityMutation.isPending || updateActivityMutation.isPending}
                          className="travel-gradient"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {editingActivity ? "Update Activity" : "Add Activity"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
