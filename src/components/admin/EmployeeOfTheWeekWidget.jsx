import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Crown, 
  Award, 
  Calendar,
  TrendingUp,
  Users,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfWeek, endOfWeek, isThisWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { EmployeeOfTheWeek, Employee } from '@/api/entities';
import AvatarGenerator from "../ui/AvatarGenerator";

export default function EmployeeOfTheWeekWidget({ compact = false }) {
  const [currentWinner, setCurrentWinner] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [previousWinners, setPreviousWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentWinner();
  }, []);

  const loadCurrentWinner = async () => {
    try {
      setIsLoading(true);
      
      // Charger les nominations et employés
      const [nominations, employees] = await Promise.all([
        EmployeeOfTheWeek.list(),
        Employee.list()
      ]);

      // Trouver le gagnant de cette semaine
      const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const thisWeekWinner = nominations.find(nom => 
        nom.week_start_date === thisWeekStart && 
        nom.approval_status === 'approved'
      );

      if (thisWeekWinner) {
        const winnerEmployee = employees.find(emp => emp.id === thisWeekWinner.employee_id);
        setCurrentWinner(thisWeekWinner);
        setEmployee(winnerEmployee);
      }

      // Charger les 3 gagnants précédents
      const previousWinnersData = nominations
        .filter(nom => 
          nom.approval_status === 'approved' && 
          nom.week_start_date !== thisWeekStart
        )
        .sort((a, b) => new Date(b.week_start_date) - new Date(a.week_start_date))
        .slice(0, 3)
        .map(nom => ({
          ...nom,
          employee: employees.find(emp => emp.id === nom.employee_id)
        }));

      setPreviousWinners(previousWinnersData);
      
    } catch (error) {
      console.error('Error loading employee of the week:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={compact ? "" : "shadow-xl"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Employé de la Semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact && currentWinner && employee) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AvatarGenerator
                firstName={employee.first_name}
                lastName={employee.last_name}
                email={employee.email}
                department={employee.department}
                size="md"
                className="ring-2 ring-yellow-400"
              />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-yellow-900 truncate">
                🏆 {employee.first_name} {employee.last_name}
              </h4>
              <p className="text-xs text-yellow-700 truncate">
                Employé de la semaine • {currentWinner.performance_score}/100
              </p>
            </div>
            <Link to={createPageUrl("EmployeeOfTheWeekManager")}>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-yellow-200">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          Employé de la Semaine
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        
        {currentWinner && employee ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            
            {/* Gagnant actuel */}
            <div className="text-center">
              <div className="relative inline-block">
                <AvatarGenerator
                  firstName={employee.first_name}
                  lastName={employee.last_name}
                  email={employee.email}
                  department={employee.department}
                  size="xl"
                  className="ring-4 ring-yellow-400 shadow-lg"
                />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-yellow-900 mt-4">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-yellow-700 font-medium">{employee.position}</p>
              <p className="text-yellow-600 text-sm">{employee.department}</p>
              
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-yellow-700">
                    {currentWinner.performance_score}/100
                  </span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Calendar className="w-3 h-3 mr-1" />
                  Cette semaine
                </Badge>
              </div>
            </div>

            {/* Raison */}
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">Pourquoi cette nomination ?</h4>
              <p className="text-gray-700 text-sm">{currentWinner.nomination_reason}</p>
              
              {currentWinner.achievements && currentWinner.achievements.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-gray-800 text-sm mb-1">Accomplissements :</h5>
                  <ul className="space-y-1">
                    {currentWinner.achievements.slice(0, 3).map((achievement, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Métriques rapides */}
            {currentWinner.metrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-green-600">
                    {currentWinner.metrics.attendance_rate || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Présence</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-blue-600">
                    {currentWinner.metrics.punctuality_score || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Ponctualité</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-purple-600">
                    {currentWinner.metrics.team_impact || 0}%
                  </div>
                  <div className="text-xs text-gray-600">Impact</div>
                </div>
              </div>
            )}

            {/* Gagnants précédents */}
            {previousWinners.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Gagnants Précédents
                </h4>
                <div className="space-y-2">
                  {previousWinners.map((winner, index) => (
                    <div key={winner.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-yellow-100">
                      {winner.employee && (
                        <>
                          <AvatarGenerator
                            firstName={winner.employee.first_name}
                            lastName={winner.employee.last_name}
                            email={winner.employee.email}
                            department={winner.employee.department}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {winner.employee.first_name} {winner.employee.last_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {format(new Date(winner.week_start_date), 'd MMM yyyy', { locale: fr })}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {winner.performance_score}/100
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            <div className="text-center pt-4 border-t border-yellow-200">
              <Link to={createPageUrl("EmployeeOfTheWeekManager")}>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  <Trophy className="w-4 h-4 mr-2" />
                  Gérer les Nominations
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Pas encore de gagnant cette semaine
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Nominez un employé exceptionnel pour cette semaine
            </p>
            <Link to={createPageUrl("EmployeeOfTheWeekManager")}>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                <Users className="w-4 h-4 mr-2" />
                Faire une Nomination
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}